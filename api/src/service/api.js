/**
 * Logic for interacting with the API
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { getObject } from './activitypub.js';
import { Follower } from '../model/api.js';
import { getActorId } from './user.js';
import type { Activity, Event, Actor, Object$Document } from '../model/activitypub.js';

const getFollowState = async (followeeId:string, followerId:?string):Promise<?api$FollowState> => {
  if (!followerId) {
    // Can't follow someone if you're not logged in
    return null;
  }

  const follow = await Follower.findOne({ 
    follower: followerId,
    followee: followeeId
  });

  return follow ? 'following' : 'can-follow';
};

export const mapUser = async (json:?$Shape<Actor>, currentUsername:?string = null):Promise<?api$User> => {
  if (!json) {
    return null;
  }
  return {
    type: 'Person',
    name: json.preferredUsername,
    url: String(json.id),
    following: await getFollowState(String(json.id), currentUsername && getActorId(currentUsername))
  };
};

export const mapActivity = async (json:?$Shape<Activity>):Promise<?api$Activity> => {

  if (!json) {
    return null;
  }

  const [ user, object ] = await Promise.all([
    getObject(json.actor).then(mapUser),
    getObject(json.object).then(mapObject)
  ])

  if (!object || !user) {
    // Bail if we can't get the data we need
    return null;
  }

  const activity = {
    url: String(json.id),
    user: (user:api$User),
    published: json.published || new Date().toISOString()
  };

  if (json.type === 'Create' && object.type === 'Event') {
    return {
      type: 'Create',
      object,
      ...activity
    };
  }

  if (json.type === 'Follow' && object.type === 'Person') {
    return {
      type: 'Follow',
      object,
      ...activity
    };
  }

  return null;
};

export const mapObject = async (json:?$Shape<Object$Document>):Promise<?api$Object> => {

  if (!json) {
    return null;
  }

  switch (json.type) {
  case 'Event': return mapEvent(json);
  case 'Person': return mapUser(json);
  }
};

const mapEvent = async (json:$Shape<Event>):Promise<?api$Event> => {
  const actor = await getObject(json.attributedTo).then(mapUser);

  if (!actor) {
    // Bail if we can't get what we need
    return null;
  }

  return {
    type: 'Event',
    name: json.name || '',
    host: actor,
    start: json.startTime || new Date().toISOString(),
    end: json.endTime || new Date().toISOString()
  };
};
