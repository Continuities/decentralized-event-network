/**
 * Models an ActivityPub Activity object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema, Object$Document } from './object.js';

const Activity$Schema = new Object$Schema({
  to: [ String ],
  cc: [ String ],
  bto: [ String ],
  bcc: [ String ],
  audience: [ String ],
  actor: String,
  published: Date,
  object: String
});

Activity$Schema.pre('save', async function() {
  if (this.isNew) { 
    this.published = new Date();
  }
});

export class Activity$Document extends Object$Document {
  to: ?[ string ];
  cc: ?[ string ];
  bto: ?[ string ];
  bcc: ?[ string ];
  audience: ?[string];
  actor: string;
  published: string;
  object: string;
}

Activity$Schema.loadClass(Activity$Document);

const Activity:Class<Activity$Document> = Mongoose.model('Activity', Activity$Schema);

export default Activity;
