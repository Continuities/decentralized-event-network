/**
 * Main controller for ActivityPub endpoints
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import express from 'express';
import { 
  withAuthentication
} from '../service/auth.js';

import type { Router } from 'express';
import type { auth$Request } from '../service/auth.js'

const router:Router<auth$Request> = express.Router();

router.get('/', (req, res) => {
  res.send('TODO');
});

export default router;