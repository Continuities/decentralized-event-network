/**
 * Models an ActivityPub Activity object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';
import { Activity } from 'activitypub';

const Activity$Schema = new Object$Schema({
  actor: String,
  object: String
});

Activity$Schema.pre('save', async function() {
  if (this.isNew) { 
    this.published = new Date();
  }
});

Activity$Schema.loadClass(Activity);

const ActivityDocument:Class<Activity> = Mongoose.model('Activity', Activity$Schema);

export default ActivityDocument;
