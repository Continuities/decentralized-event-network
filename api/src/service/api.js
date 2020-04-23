/**
 * Logic for interacting with the API
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { getObject } from './activitypub.js';
import type { Activity$Document, Event$Document, Actor$Document } from '../model/activitypub.js';

export type ApiUser = {|
  name: string,
  url: string
|};

export type ApiActivity = {|
  type: string,
  url: string,
  user: ApiUser,
  published: string,
  object: ApiObject
|};

export type ApiEvent = {|
  type: 'Event',
  name: string,
  host: ApiUser,
  start: string,
  end: string
|};

// TODO: Support other relevant object types
type ApiObject = ApiEvent;

const resolve = async <T>(thing:T | string): Promise<?T> => {
  if (typeof thing === 'string') {
    return getObject(thing);
  }
  return thing;
};

export const mapUser = (json:?Actor$Document):?ApiUser => {
  if (!json) {
    return null;
  }
  return {
    name: json.preferredUsername,
    url: String(json.id)
  };
};

export const mapActivity = async (json:?Activity$Document):Promise<?ApiActivity> => {

  if (!json) {
    return null;
  }

  if (json.type !== 'Create') {
    // TODO: Support other relevant activity types
    return null;
  }

  const [ user, object ] = await Promise.all([
    resolve(json.actor).then(mapUser),
    resolve(json.object).then(mapObject)
  ])

  if (!object || !user) {
    // Bail if we can't get the data we need
    return null;
  }

  return {
    type: json.type,
    url: String(json.id),
    user,
    published: json.published,
    object
  };
};

export const mapObject = async (json:?Event$Document):Promise<?ApiObject> => {

  if (!json) {
    return null;
  }

  if (json.type !== 'Event') {
    // TODO: Support other relevant object types
    return null;
  }
  
  const actor = await resolve(json.attributedTo).then(mapUser);

  if (!actor) {
    // Bail if we can't get what we need
    return null;
  }

  return {
    type: 'Event',
    name: json.name,
    host: actor,
    start: json.startTime,
    end: json.endTime
  };
};