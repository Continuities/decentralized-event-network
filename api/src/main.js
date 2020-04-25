// @flow

import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import UserController from './controller/user.js';
import ActivityPubController from './controller/activitypub.js';

dotenv.config();

const app:express$Application<> = express();
const upload = multer();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());

app.use('/api/user', 
  (req, res, next:express$NextFunction) => {
    res.set('Cache-Control', 'no-store');
    next();
  },
  UserController);

app.use('/', ActivityPubController);

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;
