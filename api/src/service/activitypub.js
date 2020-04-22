/**
 * Service for manipulating ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Actor, Event, Activity } from '../model/activitypub.js';
import uuid from 'short-uuid';

export const getActorId = (username:string) => {
  return `${process.env.DOMAIN || ''}/user/${username}`;
};

export const newUser = async (name:string, pubKey:string) => {
  return new Actor({
    name,
    publicKey: {
      id: '',
      owner: '',
      publicKeyPem: pubKey
    }
  }).save();
};

export const createEvent = async (name:string, host:string, start:Date, end:Date) => {
  const eventId = `${process.env.DOMAIN || ''}/event/${uuid.generate()}`;
  outbox({
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Create",
    "id": `${host}/activities/${uuid.generate()}`,
    "to": [ `${host}/followers/`, 'https://www.w3.org/ns/activitystreams#Public' ], // TODO: Event privacy
    "actor": host,
    "object": {
      "type": "Event",
      "id": eventId,
      "name": name,
      "attributedTo": host,
      "startTime": start.toISOString(),
      "endTime": end.toISOString()
      // TODO: implement locations
    }
  });
  return eventId;
};

const outbox = async (activity:Object):Promise<?string> => {
  // TODO: Check to/cc/bcc and put this in the relevant inboxes
  // TODO: Implement the rest of the relevant activity types
  switch (activity.type.toLowerCase()) {
  case 'create':
    if (!activity.object) { return; }
    // Replace the object in the activity with a reference
    activity.object = await saveObject(activity.object);
    if (activity.object) {
      // Only post activities for objects we know about
      new Activity(activity).save();
    }
  }
};

const saveObject = async (object:Object):Promise<?string> => {
  // TODO: Implement the rest of the relevant object types
  switch (object.type.toLowerCase()) {
  case 'event': {
    await (new Event(object)).save();
    return object.id;
  }
  }
  return null;
};