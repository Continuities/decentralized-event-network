/**
 * Outbox collection for mapping Activities to outboxes
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import Activity from '../activitypub/activity.js';

const Outbox$Schema = new Mongoose.Schema({
  from: { type: String, index: true },
  published: Date,
  activity: { type: Mongoose.Schema.Types.ObjectId, ref: 'Activity' }
});

class Outbox$Document /* :: extends Mongoose$Document */ {
  from: string;
  published: string;
  activity: bson$ObjectId | string | number | Activity;
  static async removeActivity(activityId: bson$ObjectId | string | number) {
    const toRemove = await Outbox.find({ activity: activityId });
    return Promise.all(toRemove.map(item => item.remove()));
  }
}

Outbox$Schema.loadClass(Outbox$Document);

const Outbox:Class<Outbox$Document> = Mongoose.model('Outbox', Outbox$Schema);

export default Outbox;
