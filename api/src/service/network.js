/**
 * Simple network interface that supports http signatures
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import http from 'http';
import https from 'https';
import crypto from 'crypto';
import httpSignature from 'http-signature';
import { getUserModel } from './user.js';
import { getUser } from './security.js';

const makeRequest = async (method: 'GET' | 'POST', urlString:string, data:?any):Promise<string> => {

  const url = new URL(urlString);

  const user = getUser();
  const userModel = (user && user.name) ? await getUserModel(user.name) : null;

  const body = JSON.stringify(data);

  const digest = crypto
    .createHash("sha256")
    .update(body || '')
    .digest("hex");

  const headers = {
    'Accept': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams',
    'Content-Type': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
    'Content-Length': body ? body.length : 0,
    'Digest': `sha-256=${digest}`
  };

  const requestOptions = {
    host: url.hostname,
    path: url.pathname,
    port: parseInt(url.port),
    protocol: url.protocol,
    method: method,
    headers
  };

  return new Promise((resolve) => {

    const responseCallback = res => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    };

    const req = url.protocol === 'https:' 
      ? https.request({ ...requestOptions }, responseCallback)   
      : http.request({ ...requestOptions }, responseCallback);

    if (userModel) {
      httpSignature.sign(req, {
        key: userModel.privateKey,
        keyId: userModel.actorId,
        headers: [ 
          'date', 
          'host', 
          '(request-target)', 
          'content-length',
          'digest'
        ]
      });
    }

    if (body) {
      req.write(body);
    }

    req.end();
  });
};

export const get = (url:string) => makeRequest('GET', url);
export const post = (url:string, data:?any) => makeRequest('POST', url, data);
