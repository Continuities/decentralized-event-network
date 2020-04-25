/**
 * Models an ActivityPub Activity object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema, Object$Document } from './object.js';

const Activity$Schema = new Object$Schema({
  actor: String,
  object: String
});

Activity$Schema.pre('save', async function() {
  if (this.isNew) { 
    this.published = new Date();
  }
});

class Activity$Document extends Object$Document {
  actor: string;
  object: string | $Shape<Object$Document> | $Shape<Activity$Document>;
}

Activity$Schema.loadClass(Activity$Document);

const Activity:Class<Activity$Document> = Mongoose.model('Activity', Activity$Schema);

export default Activity;
