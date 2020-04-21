/**
 * Models an ActivityPub Actor object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';
import { getActorId } from '../../service/activitypub.js';

const Actor$Schema = new Object$Schema({
  preferredUsername: String,
  name: { type: String, unique: true, index:true },
  inbox: String,
  outbox: String,
  publicKey: {
    id: String,
    owner: String,
    publicKeyPem: String
  }
});

class Actor$Document /* :: extends Mongoose$Document */ {
  preferredUsername: string;
  name: string;
  inbox: string;
  outbox: string;
  publicKey: {
    id: string,
    owner: string,
    publicKeyPem: string
  };
}

Actor$Schema.pre('save', function() {
  this.id = getActorId(this.name);
  this.type = 'Person';
  this.inbox = `${this.id}/inbox`;
  this.outbox = `${this.id}/outbox`;
  if (!this.preferredUsername) {
    this.preferredUsername = this.name;
  }
  this.publicKey.id = `${this.id}#main-key`,
  this.publicKey.owner = this.id
});

Actor$Schema.loadClass(Actor$Document);

const Actor:Class<Actor$Document> = Mongoose.model('Actor', Actor$Schema);

export default Actor;