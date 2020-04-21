/**
 * Models an ActivityPub Event object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';
import uuid from 'short-uuid';

const Event$Schema = new Object$Schema({
  name: String,
  startTime: String,
  endTime: String
});

class Event$Document /* :: extends Mongoose$Document */ {
  name: string;
  startTime: string;
  endTime: string;
}

Event$Schema.pre('save', function() {
  const base = `${process.env.DOMAIN || ''}/event/`;
  this.id = `${base}${uuid.generate()}`;
  this.type = 'Event';
});

Event$Schema.loadClass(Event$Document);

const Event:Class<Event$Document> = Mongoose.model('Event', Event$Schema);

export default Event;