/**
 * Main controller for ActivityPub endpoints
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import url from 'url';
import { 
  getUser
} from '../service/security.js';
import {
  toInbox, 
  renderCollection,
  renderOrderedCollection
} from '../service/activitypub.js';
import { 
  getActorId, 
  getActor, 
  getFollowers, 
  getFollowing,
  getOutbox,
  getInbox,
  getActivity,
  getAttending
} from '../service/user.js';
import {
  getEventId,
  getEvent,
  getOutbox as getEventOutbox,
  getActivity as getEventActivity,
  getAttendees
} from '../service/event.js';
import v from 'express-validator';
import { userExists, eventExists } from '../validators.js';

import type { Router } from 'express';

const router:Router<> = express.Router();

/** 
 * Block client-server POST for now. 
 * Implementation left as an excercise for the reader.
 */
router.post('/user/:username/outbox', async (req, res) => {
  // We don't currently support client-server publishing
  // It's all done through the REST api
  res.sendStatus(405);
});

/**
 * Server-server federation
 */
router.post('/user/:username/inbox', 
  v.check('username').custom(userExists),
  async (req, res) => {
    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.sendStatus(404);
    }
    const activity = (req.body:Object);
    if (!activity || !activity.id) {
      return res.sendStatus(400);
    }
    try {
      await toInbox(getActorId(req.params.username), activity);
    }
    catch {
      return res.sendStatus(500);
    }
    res.sendStatus(201);
  }
);
router.post('/event/:eventId/inbox', 
  v.check('eventId').custom(eventExists),
  async (req, res) => {
    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.sendStatus(404);
    }
    const activity = (req.body:Object);
    if (!activity || !activity.id) {
      return res.sendStatus(400);
    }
    try {
      await toInbox(getEventId(req.params.eventId), activity);
    }
    catch {
      return res.sendStatus(500);
    }
    res.sendStatus(201);
  }
);

/*
 * ActivityPub object routes
 */
const getter = <T>(get:({ [string]: string }) => Promise<?T>) => {
  return async (req, res) => {
    const id = url.format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.originalUrl
    });
    const object = await get({ ...req.params, id });
    if (!object) {
      return res.sendStatus(404);
    }
    return res.json(object);
  };
};

router.get('/user/:userId', getter(({ userId }) => getActor(userId)));
router.get('/user/:userId/followers', getter(async ({ id, userId }) => 
  renderCollection(id, await getFollowers(userId))));
router.get('/user/:userId/followers', getter(async ({ id, userId }) => 
  renderCollection(id, await getFollowers(userId))));
router.get('/user/:userId/following', getter(async ({ id, userId }) => 
  renderCollection(id, await getFollowing(userId))));
router.get('/user/:userId/attending', getter(async ({ id, userId }) => 
  renderCollection(id, await getAttending(userId))));
router.get('/user/:userId/inbox', 
  (req, res, next:express$NextFunction) => {
    const user = getUser();
    if (!user || user.id !== getActorId(req.params.userId)) {
      return res.sendStatus(401);
    }
    next();
  },
  getter(async ({ id, userId }) => renderOrderedCollection(id, await getInbox(userId)))
);
router.get('/user/:userId/outbox', getter(async ({ id, userId }) => 
  renderOrderedCollection(id, await getOutbox(userId))));
router.get('/user/:userId/activities/:activityId', getter(({ userId, activityId }) =>
  getActivity(userId, activityId)));
router.get('/event/:eventId', getter(({ eventId }) => getEvent(eventId)));
router.get('/event/:eventId/outbox', getter(async ({ id, eventId }) => 
  renderOrderedCollection(id, await getEventOutbox(eventId))));
router.get('/event/:eventId/activities/:activityId', getter(({ eventId, activityId }) =>
  getEventActivity(eventId, activityId)));
router.get('/event/:eventId/attendees', getter(async ({ id, eventId }) =>
  renderCollection(id, await getAttendees(eventId))));

export default router;
