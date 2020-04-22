/**
 * Inbox collection for mapping Activities to inboxes
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';

const Inbox$Schema = new Mongoose.Schema({
  to: { type: String, index: true },
  activity: String
});

class Inbox$Document /* :: extends Mongoose$Document */ {
  to: string;
  activity: string;
}

Inbox$Schema.loadClass(Inbox$Document);

const Inbox:Class<Inbox$Document> = Mongoose.model('Inbox', Inbox$Schema);

export default Inbox;