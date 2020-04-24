/**
 * Service for interacting with users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { getActivityId } from './activitypub.js';
import { Actor, Activity } from '../model/activitypub.js';
import { sanitized } from './db.js';
import { Inbox, Outbox } from '../model/api.js';

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

export const getActor = async (username:string): Promise<?Actor> => {
  const actor = await Actor.findOne({ name: username });
  return actor ? sanitized(actor) : null;
}

export const getActivity = async (username:string, activityUUID:string): Promise<?Activity> => {
  const activity = await Activity.findOne({ id: getActivityId(username, activityUUID) });
  return activity ? sanitized(activity) : null;
}

export const getFollowers = async (username:string): Promise<Array<string>> => {
  // TODO
  console.log(`TODO: getFollowers for ${username}`)
  return [ ];
};

export const getInbox = async (username:string): Promise<Array<Activity>> => {
  const entries:Array<Inbox> = await Inbox
    .find({ to: getActorId(username) })
    .sort({ 'published': -1 })
    .populate('activity');

  // $FlowFixMe Not sure how to handle populated fields in Flow
  return entries.map(o => sanitized(o.activity)); 
};

export const getOutbox = async (username:string): Promise<Array<Activity>> => {
  const entries:Array<Outbox> = await Outbox
    .find({ from: getActorId(username) })
    .sort({ 'published': -1 })
    .populate('activity');

  // $FlowFixMe Not sure how to handle populated fields in Flow
  return entries.map(o => sanitized(o.activity)); 
};
