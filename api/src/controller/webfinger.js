/**
 * Handles webfinger endpoints
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import express from 'express';
import { getIdentity } from '../service/webfinger.js';

import type { Router } from 'express';

const router:Router<> = express.Router();

router.get('/webfinger', async (req, res) => {
  console.log(req.query);
  const resourceId = Array.isArray(req.query.resource) 
    ? req.query.resource[0]
    : req.query.resource;
  const identity = await getIdentity(resourceId);
  if (!identity) {
    return res.sendStatus(404);
  }
  return res.json(identity);
});

export default router;
