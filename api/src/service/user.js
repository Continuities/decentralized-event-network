/**
 * Service for interacting with users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { getActivityId } from './activitypub.js';
import { Actor, Activity } from '../model/activitypub.js';
import { sanitized } from './db.js';

export const getActorId = (username:string) => {
  return `${process.env.DOMAIN || ''}/user/${username}`;
};

export const newUser = async (name:string, pubKey:string) => {
  const id = getActorId(name);
  return new Actor({
    id,
    name,
    type: 'Person',
    inbox: `${id}/inbox`,
    outbox: `${id}/outbox`,
    followers: `${id}/followers`,
    following: `${id}/following`,
    preferredUsername: name,
    publicKey: {
      id: `${id}#main-key`,
      owner: id,
      publicKeyPem: pubKey
    }
  }).save();
};

export const getActor = async (username:string): ?Object => {
  const actor = await Actor.findOne({ name: username });
  return actor ? sanitized(actor) : null;
}

export const getActivity = async (username:string, activityUUID:string): ?Object => {
  const activity = await Activity.findOne({ id: getActivityId(username, activityUUID) });
  return activity ? sanitized(activity) : null;
}

export const getFollowers = (username:string): Array<string> => {
  // TODO
  // Follow ourselves for testing purposes
  return [ getActorId(username) ];
};