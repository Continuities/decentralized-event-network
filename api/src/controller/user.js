/**
 * Controller for the /user REST endpoint
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import v from 'express-validator';
import User from '../model/user.js';
import { 
  withAuthentication,
  validatePassword, 
  generateToken 
} from '../service/auth.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const emailRegex = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

const router:Router<auth$Request> = express.Router();

// Register a new user with specified username
// Returns 422 if any inputs are bad
router.put('/:username',
  v.check('email').isEmail(),
  v.check('username').isLength({ min: 4 }).withMessage("Username must be at least 4 characters"),
  v.check('password').isLength({ min: 5 }).withMessage("Password must be at least 5 characters"),
  v.check('password-confirm').custom(async (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
  }),
  v.check('email').custom(async val => {
    const existing = await User.findOne({ email: val });
    if (existing) {
      throw 'An account with that email already exists';
    }
  }),
  v.check('username').custom(async val => {
    const existing = await User.findOne({ username: val });
    if (existing) {
      throw 'That username is taken';
    }
  }),
  async (req, res) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new User({
      username: req.params.username,
      email: (req.body:Object).email,
      password: (req.body:Object).password
    });

    const result = await user.save();
    
    res.send({
      username: result.username,
      email: result.email
    });
  }
);

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


export default router;