/**
 * Authentication functionality
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import type { Middleware } from 'express';

declare class AuthenticatedRequest extends express$Request {
  user: ?UserToken;
}

export type auth$Request = AuthenticatedRequest;
export type UserToken = {|
  username: string
|};

const TOKEN_EXPIRATON = '1800s';

export const hashPassword = async (password:string):Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const validatePassword = async (password:string, hash:string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (username:string) => {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATON });
};

export const withAuthentication:Middleware<AuthenticatedRequest> = async (req, res, next:express$NextFunction) => {
  try {
    const [ authType, token ] = req.headers.authorization.split(' ');
    if (authType.toLowerCase() === 'bearer' && token) {
      const user = await jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = user;
    }
  }
  catch(e) { /* Bad auth header */ }
  
  next();
};
