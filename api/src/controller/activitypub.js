/**
 * Main controller for ActivityPub endpoints
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import { Actor, Event } from '../model/activitypub.js';
import { sanitized } from '../service/db.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const router:Router<auth$Request> = express.Router();

router.get('/user/:username', async (req, res) => {
  const actor = await Actor.findOne({ name: req.params.username });
  if (!actor) {
    return res.sendStatus(404);
  }
  res.json(sanitized(actor));
});

router.get('/user/:username/inbox', async (req, res) => {
  // TODO
  res.json([]);
});

router.get('/user/:username/outbox', async (req, res) => {
  // TODO
  res.json([]);
});

router.get('/event/:uuid', async (req, res) => {
  const fullId = `${process.env.DOMAIN || ''}/event/${req.params.uuid}`;
  const event = await Event.findOne({ id: fullId });
  if (!event) {
    return res.sendStatus(404);
  }
  res.json(sanitized(event));
});

export default router;