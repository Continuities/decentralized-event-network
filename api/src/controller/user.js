/**
 * Controller for the /user REST endpoint
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import v from 'express-validator';
import User from '../model/api/user.js';
import { newUser, getInbox, getOutbox } from '../service/user.js';
import { createEvent } from '../service/event.js';
import generateRSAKeypair from 'generate-rsa-keypair';
import { mapActivity } from '../service/api.js';
import { 
  withAuthentication,
  validatePassword, 
  generateToken 
} from '../service/auth.js';
import {
  matchesPassword,
  uniqueEmail,
  uniqueUser,
  timespan
} from '../validators.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const emailRegex = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

const router:Router<auth$Request> = express.Router();

const dateValidator = async value => {
  if (isNaN(new Date(value).getTime())) {
    throw 'Invalid date';
  }
};

// Get a JWT by posting username/password
// Returns 401 if the provided credentials are invalid
router.post('/token', async (req, res) => {
  const { user, password } = (req.body:Object);
  if (!user || !password) {
    return res.sendStatus(401);
  }

  const isEmail = emailRegex.test(user);

  const userObject = isEmail ? 
    await User.findOne({ email: user }) :
    await User.findOne({ username: user });

  if (!userObject) {
    return res.sendStatus(401);
  }

  const isPasswordValid = await validatePassword(password, userObject.password);
  if (!isPasswordValid) {
    return res.sendStatus(401);
  }

  res.json({ token: generateToken(userObject.username) });
});

// Some private user data. This is a placeholder endpoint.
// Returns 401 if the requestor is not authenticated as the specified user
router.get('/:username/private', withAuthentication, (req, res) => {
  if (!req.user || req.user.username !== req.params.username) {
    return res.sendStatus(401);
  }
  res.sendStatus(200);
});

const mergeSortedActivities = (listA, listB) => {
  const merged = [];
  
  let ai = 0, bi = 0;
  while (ai < listA.length) {
    const da = new Date(listA[ai].published);
    while(bi < listB.length) {
      if (listB[bi].url === listA[ai].url) {
        bi++;
        continue;
      }
      const db = new Date(listB[bi].published);
      if (db < da) { break; }
      merged.push(listB[bi++]);
    }
    merged.push(listA[ai++]);
  }
  if (bi < listB.length) {
    merged.push(...listB.slice(bi));
  }

  return merged;
};

router.get('/feed', withAuthentication, async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  const user = req.user.username;

  const [ inbox, outbox ] = await Promise.all([ 
    getInbox(user).then(a => Promise.all(a.map(mapActivity)).then(a => a.filter(Boolean))), 
    getOutbox(user).then(a => Promise.all(a.map(mapActivity)).then(a => a.filter(Boolean)))
  ]);

  const feed = mergeSortedActivities(inbox, outbox);
  res.json({ activities: feed });
});

router.get('/inbox', withAuthentication, async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  const activities = await getInbox(req.user.username);
  const mapped = await Promise.all(activities.map(mapActivity).filter(a => !!a));
  res.json({ activities: mapped });
});

const outbox = async (req, res) => {
  const requestingUser = req.user && req.user.username;
  const user = req.params.username || requestingUser;
  if (!user) {
    return res.sendStatus(404);
  }
  const activities = await getOutbox(user);
  const mapped = await Promise.all(activities.map(mapActivity).filter(a => !!a));
  // TODO: Filter based on privacy
  res.json({ activities: mapped });
};

router.get('/:username/outbox', outbox);
router.get('/outbox', withAuthentication, outbox);

// Creates a new event, hosted by this user
router.put('/event', 
  withAuthentication,
  v.check('name').isLength({ min: 4 }).withMessage('Event name must be at least 4 characters long'),
  v.check('start').custom(dateValidator),
  v.check('end').custom(dateValidator),
  v.check('end').custom(timespan),
  async (req, res, next:express$NextFunction) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.sendStatus(401);
    }

    const { start, end } = (req.body:Object);
    const [ eventId, asyncAction ] = await createEvent(
      (req.body:Object).name,
      req.user.username,
      new Date(start),
      new Date(end)
    );

    // Send the response right away
    res.status(201).json({ id: eventId });

    // Wait for the async actions to finish before closing the request
    await asyncAction;

    next();
  }
);

// Register a new user with specified username
// Returns 422 if any inputs are bad
router.put('/:username',
  v.check('email').isEmail(),
  v.check('username').isLength({ min: 4 }).withMessage("Username must be at least 4 characters"),
  v.check('password').isLength({ min: 5 }).withMessage("Password must be at least 5 characters"),
  v.check('password-confirm').custom(matchesPassword),
  v.check('email').custom(uniqueEmail),
  v.check('username').custom(uniqueUser),
  async (req, res) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const keys = generateRSAKeypair();
    const actor = await newUser(req.params.username, keys.public);

    const user = new User({
      username: req.params.username,
      email: (req.body:Object).email,
      password: (req.body:Object).password,
      actorId: String(actor.id),
      privateKey: keys.private
    });

    const result = await user.save();
    
    res.status(201).send({
      username: result.username,
      email: result.email
    });
  }
);

export default router;