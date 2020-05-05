/**
 * Service for interacting with events
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Event } from '../model/activitypub.js';
import { sanitized } from './db.js';
import uuid from 'short-uuid';
import { getActorId, getFollowerUri } from './user.js';
import { toOutbox, getActivityId } from './activitypub.js';
import { Activity } from '../model/activitypub.js';
import { Outbox, Attendee } from '../model/api.js';

export const getEventId = (uuid:string) => {
  return `${process.env.DOMAIN || ''}/event/${uuid}`;
}

export const getEvent = async (eventUUID:string): ?Object => {
  const event = await Event.findOne({ id: getEventId(eventUUID) });
  return event ? sanitized(event) : null;
}

export const getActivity = async (eventUUID:string, activityUUID:string): Promise<?Activity> => {
  const activity = await Activity.findOne({ id: getActivityId(getEventId(eventUUID), activityUUID) });
  return activity ? sanitized(activity) : null;
}

export const createEvent = (name:string, username:string, start:Date, end:Date): [ string, Promise<void> ] => {
  const eventId:string = getEventId(uuid.generate());
  const hostId:string = getActorId(username);
  const asyncAction = toOutbox(getActorId(username), {
    "type": "Create",
    "to": [ 
      // TODO: Event privacy settings
      `${hostId}/followers`, 
      'https://www.w3.org/ns/activitystreams#Public' ],
    "actor": hostId,
    "object": {
      "type": "Event",
      "id": eventId,
      "name": name,
      "attributedTo": hostId,
      "startTime": (start.toISOString():string),
      "endTime": (end.toISOString():string)
      // TODO: implement locations
    }
  });
  return [ eventId, asyncAction ];
};

export const getOutbox = async (eventUID:string): Promise<Array<Activity>> => {
  const entries:Array<Outbox> = await Outbox
    .find({ from: getEventId(eventUID) })
    .sort({ 'published': -1 })
    .populate('activity');

  // $FlowFixMe Not sure how to handle populated fields in Flow
  return entries.map(o => sanitized(o.activity)); 
};

export const addAttendee = async (eventUid:?string, username:?string) => {
  if (!eventUid || !username) {
    return;
  }

  const eventId = getEventId(eventUid);
  const userId = getActorId(username);

  const attending = await Attendee.findOne({ event: eventId, attendee: userId });
  if (attending) {
    // Already attending
    return attending;
  }

  return await toOutbox(userId, {
    type: 'Join',
    to: [ eventId ],
    cc: [ getFollowerUri(username) ],
    actor: userId,
    object: eventId
  });
};

export const removeAttendee = async (eventUid:?string, username:?string) => {
  if (!eventUid || !username) {
    return;
  }

  const eventId = getEventId(eventUid);
  const userId = getActorId(username);

  const joinActivity = await Activity.findOne({ 
    type: 'Join',
    actor: userId,
    object: eventId
  });

  if (!joinActivity) {
    // Not attending
    return;
  }

  return await toOutbox(userId, {
    type: 'Undo',
    to: [ eventId ],
    cc: [ getFollowerUri(username) ],
    actor: userId,
    object: String(joinActivity.id)
  });

};
