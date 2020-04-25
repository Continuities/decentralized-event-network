/**
 * Models follower relationships
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';

const Follower$Schema = new Mongoose.Schema({
  followee: { type: String, index: true },
  follower: { type: String, index: true }
});

class Follower$Document /* :: extends Mongoose$Document */ {
  followee: string;
  follower: string;
}

Follower$Schema.loadClass(Follower$Document);

const Follower:Class<Follower$Document> = Mongoose.model('Follower', Follower$Schema);

export default Follower;
