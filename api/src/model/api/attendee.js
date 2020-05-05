/**
 * Models event attendance relationships
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';

const Attendee$Schema = new Mongoose.Schema({
  attendee: { type: String, index: true },
  event: { type: String, index: true }
});

class Attendee$Document /* :: extends Mongoose$Document */ {
  attendee: string;
  event: string;
}

Attendee$Schema.loadClass(Attendee$Document);

const Attendee:Class<Attendee$Document> = Mongoose.model('Attendee', Attendee$Schema);

export default Attendee;
