/**
 * Models an ActivityPub Event object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';
import { Event } from 'activitypub';

const Event$Schema = new Object$Schema({
  inbox: String,
  outbox: String
});

Event$Schema.pre('save', function() {
  this.inbox = `${this.id}/inbox`;
  this.outbox = `${this.id}/outbox`;
});

const EventDocument:Class<Event> = Mongoose.model('Event', Event$Schema);

export default EventDocument;
