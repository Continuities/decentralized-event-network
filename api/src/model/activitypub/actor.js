/**
 * Models an ActivityPub Actor object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema } from './object.js';
import { Actor } from 'activitypub';

const Actor$Schema = new Object$Schema({
  preferredUsername: String,
  inbox: String,
  outbox: String,
  followers: String,
  following: String,
  publicKey: {
    id: String,
    owner: String,
    publicKeyPem: String
  }
});

Actor$Schema.pre('save', function() {
  this['@context'].push('https://w3id.org/security/v1');
});

Actor$Schema.loadClass(Actor);

const ActorDocument:Class<Actor> = Mongoose.model('Actor', Actor$Schema);

export default ActorDocument;
