/**
 * Service for interacting with events
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Event } from '../model/activitypub.js';
import { sanitized } from './db.js';
import uuid from 'short-uuid';
import { getActorId } from './user.js';
import { toOutbox } from './activitypub.js';

export const getEventId = (uuid:string) => {
  return `${process.env.DOMAIN || ''}/event/${uuid}`;
}

export const getEvent = async (eventUUID:string): ?Object => {
  const event = await Event.findOne({ id: getEventId(eventUUID) });
  return event ? sanitized(event) : null;
}

export const createEvent = (name:string, username:string, start:Date, end:Date): [ string, Promise<void> ] => {
  const eventId = getEventId(uuid.generate());
  const hostId = getActorId(username);
  const asyncAction = toOutbox(username, {
    "@context": "https://www.w3.org/ns/activitystreams",
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
      "startTime": start.toISOString(),
      "endTime": end.toISOString()
      // TODO: implement locations
    }
  });
  return [ eventId, asyncAction ];
};