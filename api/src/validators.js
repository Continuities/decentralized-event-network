/**
 * Custom http validators
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { User } from './model/api.js';
import { getEvent } from './service/event.js';

type Validator = (value:string, { req: any }) => Promise<void>;

export const matchesPassword:Validator = async (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("Passwords don't match");
  }
};

export const uniqueEmail:Validator = async val => {
  const existing = await User.findOne({ email: val });
  if (existing) {
    throw 'An account with that email already exists';
  }
};

export const uniqueUser:Validator = async val => {
  const existing = await User.findOne({ username: val });
  if (existing) {
    throw 'That username is taken';
  }
};

export const userExists:Validator = async val => {
  const existing = await User.findOne({ username: val });
  if (!existing) {
    throw 'No such user';
  }
};

export const eventExists:Validator = async val => {
  const existing = await getEvent(val);
  if (!existing) {
    throw 'No such event';
  }
};

export const timespan:Validator = async (value, { req }) => {
  const start = new Date(req.body.start);
  const end = new Date(value);
  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
    throw 'End date must come after start date'
  }
};
