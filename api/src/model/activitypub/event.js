/**
 * Models an ActivityPub Event object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema, Object$Document } from './object.js';

const Event$Schema = new Object$Schema({
  name: String,
  attributedTo: String,
  startTime: String,
  endTime: String
});

class Event$Document extends Object$Document {
  name: string;
  attributedTo: string;
  startTime: string;
  endTime: string;
}

Event$Schema.loadClass(Event$Document);

const Event:Class<Event$Document> = Mongoose.model('Event', Event$Schema);

export default Event;