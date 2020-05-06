/**
 * Controller for the /event REST endpoint
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import express from 'express';
import v from 'express-validator';
import { withAuthentication } from '../service/auth.js';
import { 
  getEvent, 
  getOutbox,
  addAttendee,
  removeAttendee
} from '../service/event.js';
import { mapEvent, mapActivity } from '../service/api.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const router:Router<auth$Request> = express.Router();

router.get('/:eventId', withAuthentication, async (req, res) => {
  const event = await getEvent(req.params.eventId);
  if (!event) {
    return res.sendStatus(404);
  }
  res.json(await mapEvent(event, req.user ? req.user.username : null));
});

router.get('/:eventId/outbox', withAuthentication, async (req, res) => {
  const activities = await getOutbox(req.params.eventId);
  const mapped = await Promise.all(activities.map(a => mapActivity(a, req.user ? req.user.username : null)));
  // TODO: Filter based on privacy
  res.json({ activities: mapped.filter(Boolean) });
});

router.post('/:eventId/join', 
  withAuthentication, 
  v.check('value').isBoolean(),
  async (req, res) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = req.user ? req.user.username : null;
    if (!user) {
      // TODO: Anonymous event attendance?
      return res.sendStatus(401);
    }
    
    const attend:boolean = (req.body:Object).value;

    if (attend) {
      addAttendee(req.params.eventId, user);
    }
    else {
      removeAttendee(req.params.eventId, user);
    }

    res.status(201).json({ value: attend });
  });

export default router;
