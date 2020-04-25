/**
 * Inbox collection for mapping Activities to inboxes
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';

const Inbox$Schema = new Mongoose.Schema({
  to: { type: String, index: true },
  published: Date,
  activity: { type: Mongoose.Schema.Types.ObjectId, ref: 'Activity' }
});

class Inbox$Document /* :: extends Mongoose$Document */ {
  to: string;
  published: string;
  activity: bson$ObjectId | string | number;
  static async removeActivity(activityId: bson$ObjectId | string | number) {
    const toRemove = await Inbox.find({ activity: activityId });
    return Promise.all(toRemove.map(item => item.remove()));
  }
}

Inbox$Schema.loadClass(Inbox$Document);

const Inbox:Class<Inbox$Document> = Mongoose.model('Inbox', Inbox$Schema);

export default Inbox;
