/**
 * Api Event data model
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';

const Event$Schema = new Mongoose.Schema({
  name: String,
  host: String,
  startTime: Date,
  endTime: Date
});

class Event$Document /* :: extends Mongoose$Document */ {
  name: string;
  host: string;
  startTime: Date;
  endTime: Date;
}

Event$Schema.loadClass(Event$Document);

const Event = Mongoose.model('Event', Event$Schema);

export default Event;