/**
 * Controller for the /user REST endpoint
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import v from 'express-validator';
import User from '../model/api/user.js';
import {  
  newUser, 
  addFollower,
  removeFollower,
  getUserModel
} from '../service/user.js';
import { createEvent } from '../service/event.js';
import generateRSAKeypair from 'generate-rsa-keypair';
import { 
  validatePassword, 
  generateToken,
  getUser
} from '../service/security.js';
import {
  matchesPassword,
  uniqueEmail,
  uniqueUser,
  timespan
} from '../validators.js';

import type { Router } from 'express';

const router:Router<> = express.Router();

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

  const userModel = await getUserModel(user);

  if (!userModel) {
    return res.sendStatus(401);
  }

  const isPasswordValid = await validatePassword(password, userModel.password);
  if (!isPasswordValid) {
    return res.sendStatus(401);
  }

  res.json({ token: generateToken(userModel.username) });
});

// Creates a new event, hosted by this user
router.put('/event', 
  v.check('name').isLength({ min: 4 }).withMessage('Event name must be at least 4 characters long'),
  v.check('start').custom(dateValidator),
  v.check('end').custom(dateValidator),
  v.check('end').custom(timespan),
  async (req, res, next:express$NextFunction) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = getUser();
    if (!user || !user.name) {
      return res.sendStatus(401);
    }

    const { start, end } = (req.body:Object);
    const [ eventId, asyncAction ] = await createEvent(
      (req.body:Object).name,
      user.name,
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

router.post('/:username/follow', 
  v.check('value').isBoolean(),
  async (req, res) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = getUser();
    if (!user) {
      return res.sendStatus(401);
    }

    const follow:boolean = (req.body:Object).value;

    if (follow) {
      await addFollower(req.params.username, user.name);
    }
    else {
      await removeFollower(req.params.username, user.name);
    }

    res.status(201).json({ value: follow });
  }
);

export default router;
