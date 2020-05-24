/**
 * Controller for the /event REST endpoint
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import express from 'express';
import v from 'express-validator';
import {
  getUser 
} from '../service/security.js';
import { 
  addAttendee,
  removeAttendee
} from '../service/event.js';

import type { Router } from 'express';

const router:Router<> = express.Router();

router.post('/:eventId/join', 
  v.check('value').isBoolean(),
  async (req, res) => {

    const errors = v.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = getUser();
    if (!user) {
      // TODO: Anonymous event attendance?
      return res.sendStatus(401);
    }
    
    const attend:boolean = (req.body:Object).value;

    if (attend) {
      addAttendee(req.params.eventId, user.name);
    }
    else {
      removeAttendee(req.params.eventId, user.name);
    }

    res.status(201).json({ value: attend });
  });

export default router;
