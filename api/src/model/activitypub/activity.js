/**
 * Models an ActivityPub Activity object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';

const Activity$Schema = new Object$Schema({
  to: [ String ],
  actor: String,
  object: String
});

class Activity$Document /* :: extends Mongoose$Document */ {
  to: [ string ];
  actor: string;
  object: string;
}

Activity$Schema.loadClass(Activity$Document);

const Activity:Class<Activity$Document> = Mongoose.model('Activity', Activity$Schema);

export default Activity;