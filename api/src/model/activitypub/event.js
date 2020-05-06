/**
 * Models an ActivityPub Event object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema, Object$Document } from './object.js';

const Event$Schema = new Object$Schema({
  inbox: String,
  outbox: String
});

class Event$Document extends Object$Document {
  inbox: string;
  outbox: string;
}

Event$Schema.pre('save', function() {
  this.inbox = `${this.id}/inbox`;
  this.outbox = `${this.id}/outbox`;
});

const Event:Class<Event$Document> = Mongoose.model('Event', Event$Schema);

export default Event;
