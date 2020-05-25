/**
 * Authentication functionality
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import httpContext from 'express-http-context';
import httpSignature from 'http-signature';
import { getActorId, getActor } from './user.js';
import { getObject } from './activitypub.js';
import { splitOnce } from '../util.js';

import type { Middleware } from 'express';
import type { Actor } from 'activitypub';

export type UserToken = {|
  userId: string,
  username: string
|};

const TOKEN_EXPIRATON = '1800h'; // TODO: Shorten this in production

export const hashPassword = async (password:string):Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const validatePassword = async (password:string, hash:string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (username:string) => {
  return jwt.sign({
    userId: getActorId(username),
    username 
  }, process.env.TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATON });
};

export const withHeaderValidation:Middleware<> = async (req, res, next:express$NextFunction) => {

  const date = req.header('Date');
  if (date && new Date() - new Date(date) > 1000 * 60 * 5) {
    // Request is too old
    return res.sendStatus(400);
  }

  const expectedLength = req.header('Content-Length');
  let body = req.body == null ? '' : JSON.stringify(req.body) || '';
  if (body === '{}') {
    body = '';
  }
  if (expectedLength && body.length !== parseInt(expectedLength)) {
    // Content-Length is wrong
    return res.sendStatus(400);
  }

  const digest = req.header('Digest');
  if (digest) {
    const digests = digest.split(',');
    for (let d of digests) {
      const [ algo, hash ] = splitOnce(d, '=');
      const compare = crypto
        .createHash(algo.replace('-', ''))
        .update(body)
        .digest("hex");
      if (hash !== compare) {
        // Digest doesn't match actual body hash
        return res.sendStatus(400);
      }
    }
  }

  next();
};

export const withAuthentication:Middleware<> = async (req, res, next:express$NextFunction) => {
  try {
    const [ authType, authValue ] = splitOnce(req.headers.authorization, ' ');
    if (authType.toLowerCase() === 'bearer' && authValue) {
      // JWT authorization from client
      const { username } = await jwt.verify(authValue, process.env.TOKEN_SECRET);
      const user:?Actor = await getActor(username);
      if (user != null) {
        httpContext.set('user', user);
      }
    }
    else if (authType.toLowerCase() === 'signature' && authValue) {
      // HTTP Signature authorization from another server
      const signature = httpSignature.parseRequest(req);
      const user:?Actor = await getObject(signature.params.keyId);
      if (user && httpSignature.verifySignature(signature, user.publicKey.publicKeyPem)) {
        httpContext.set('user', user);
      }
    }
  }
  catch(e) { /* Bad auth header */ }
  
  next();
};

export const getUser = ():?Actor => httpContext.get('user');
