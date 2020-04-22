/**
 * Main controller for ActivityPub endpoints
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import url from 'url';
import { getObject, toInbox } from '../service/activitypub.js';
import v from 'express-validator';
import { userExists } from '../validators.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const router:Router<auth$Request> = express.Router();

/** 
 * Client-server endpoints. Implementation left as an excercise for the reader.
 */

router.get('/user/:username/inbox', async (req, res) => {
  // We don't currently support client-server publishing
  // It's all done through the REST api
  res.sendStatus(405);
});

router.post('/user/:username/outbox', async (req, res) => {
  // We don't currently support client-server publishing
  // It's all done through the REST api
  res.sendStatus(405);
});

/**
 * Server-server federation endpoints 
 */

router.get('/user/:username/outbox', async (req, res) => {
  // TODO
  res.json([]);
});

router.post('/user/:username/inbox', 
  v.check('username').custom(userExists),
  async (req, res) => {
    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.sendStatus(404);
    }
    const activity = (req.body:Object).activity;
    if (!activity || !activity.id) {
      return res.sendStatus(400);
    }
    try {
      await toInbox(req.params.username, activity);
    }
    catch {
      return res.sendStatus(500);
    }
    res.sendStatus(201);
  }
);

// Main route for getting ActivityPub objects by id
router.get('/*', async (req, res) => {
  const id = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
  const object = await getObject(id);
  if (!object) {
    return res.sendStatus(404);
  }
  res.json(object);
});

export default router;