/**
 * Service for manipulating ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Event, Activity } from '../model/activitypub.js';
import { 
  Inbox, 
  Outbox, 
  Follower,
  Attendee
} from '../model/api.js';
import uuid from 'short-uuid';
import fetch from 'node-fetch';

import type { ObjectBase } from 'activitypub';

export const getActivityId = (actorId:string, uuid:string) => {
  return `${actorId}/activities/${uuid}`
};

const addAttendee = async (eventId:string, attendeeId:string) => {
  const existing = await Attendee.findOne({
    attendee: attendeeId, 
    event: eventId
  });

  if (existing) { 
    // Don't insert duplicate records
    return; 
  }

  return new Attendee({
    attendee: attendeeId,
    event: eventId
  }).save();
};

const addFollower = async (followeeId:string, followerId:string) => {
  const existing = await Follower.findOne({
    followee: followeeId, 
    follower: followerId
  });

  if (existing) { 
    // Don't insert duplicate records
    return; 
  }

  return new Follower({ 
    followee: followeeId, 
    follower: followerId
  }).save();
};

const undoActivity = async (activityId:string) => {
  const undone = await Activity.findOneAndDelete({ id: activityId });
  if (!undone) {
    return;
  }

  const ops = [
    // Remove from in/outboxes
    Inbox.removeActivity(undone._id),
    Outbox.removeActivity(undone._id)
  ];

  // Undo side-effects
  // TODO: It'd be nice to factor activity side-effects to somewhere
  //       central to keep all the logic together
  switch (undone.type) {
  case 'Follow':
    ops.push(Follower.deleteOne({ 
      followee: undone.object, 
      follower: undone.actor
    }));
    break;
  case 'Join':
    ops.push(Attendee.deleteOne({
      event: undone.object,
      attendee: undone.actor
    }));
    break;
  }

  return Promise.all(ops);
}

export const toInbox = async (actorId:string, activity:Activity) => {
  // TODO: Handle forward-from-inbox https://www.w3.org/TR/activitypub/#inbox-forwarding

  switch (activity.type.toLowerCase()) {
  case 'follow': {
    // https://www.w3.org/TR/activitypub/#follow-activity-inbox
    if (activity.object === actorId) {
      const toId = typeof activity.actor === 'string' ? activity.actor : String(activity.actor.id);
      toOutbox(actorId, {
        type: 'Accept',
        actor: actorId,
        to: [ toId ],
        object: activity
      });
      await addFollower(
        actorId,
        toId
      );
    }
    break;
  }
  case 'join': {
    // Same request/response pattern as follow
    if (activity.object === actorId) {
      const toId = typeof activity.actor === 'string' ? activity.actor : String(activity.actor.id);
      toOutbox(actorId, {
        type: 'Accept',
        actor: actorId,
        to: [ toId ],
        object: activity
      });
      await addAttendee(
        actorId,
        toId
      );
    }
    break;
  }
  case 'accept': {
    const acceptedActivity = await getObject(activity.object);
    if (!acceptedActivity) {
      return;
    }
    switch (acceptedActivity.type.toLowerCase()) {
    case 'follow': {
      await addFollower(
        acceptedActivity.object, 
        acceptedActivity.actor
      );
      break;
    }
    case 'join': {
      await addAttendee(
        acceptedActivity.object,
        acceptedActivity.actor
      );
      break;
    }
    }
    break;
  }
  case 'undo': {
    // Instead of saving a new activity, these remove an old one
    const undoneId = typeof activity.object === 'string' ? activity.object : String(activity.object.id);
    await undoActivity(undoneId);
    return;
  }
  // TODO side-effects for other activity types
  }

  let dbActivity = await Activity.findOne({ id: activity.id });
  if (!String(activity.id).startsWith(process.env.DOMAIN || '')) {
    // Store a copy the first time we see a remote activity
    dbActivity = await new Activity(activity).save();
  }
  if (!dbActivity) {
    // This means it's a local activity that isn't stored.
    // This shouldn't happen, so just abort.
    throw 'Non-existent local activity delivered to an inbox =/';
  }

  const entry = new Inbox({
    to: actorId,
    published: dbActivity.published || new Date().toISOString(),
    activity: dbActivity._id
  });
  return entry.save();
};

// Submit an activity to an actor's outbox. Currently called by the REST api
// during POST, but could be easily modified to allow direct client-server ActivityPub
export const toOutbox = async (actorId:string, activity:$Shape<Activity>):Promise<void> => {
  // TODO: Validate that the activity's actor matches the username
  activity.id = getActivityId(actorId, uuid.generate());
  let createdActivity;
  switch (activity.type.toLowerCase()) {
  case 'create': {
    // Replace the object in the activity with a reference
    if (typeof activity.object !== 'string') {
      const newObject = await saveObject(activity.object);
      if (!newObject) { return; }
      activity.object = newObject;
      createdActivity = await new Activity(activity).save();
    }
    break;
  }
  case 'join':
  case 'follow': {
    createdActivity = await new Activity(activity).save();
    break;
  }
  case 'accept': {
    if (typeof activity.object !== 'string') {
      // Replace full object with its id
      activity.object = String(activity.object.id);
    }
    createdActivity = await new Activity(activity).save();
    break;
  }
  case 'undo': {
    // Instead of saving a new activity, these remove an old one
    const undoneId = typeof activity.object === 'string' ? activity.object : String(activity.object.id);
    await undoActivity(undoneId);
    return publish(activity);
  }
  // TODO: Implement the rest of the relevant activity types
  }

  if (!createdActivity) {
    return;
  }

  await new Outbox({
    from: actorId,
    published: createdActivity.published || new Date().toISOString(),
    activity: createdActivity._id
  }).save();

  return publish(activity);
};

const publish = async (activity:Activity):Promise<void> => {

  // TODO: Don't resolve collections belonging to others https://www.w3.org/TR/activitypub/#outbox-delivery

  const destinations = [ 
    ...(activity.to || []),
    ...(activity.bto || []),
    ...(activity.cc || []),
    ...(activity.bcc || []),
    ...(activity.audience || [])
  ];

  const uris:Array<Set<string>> = await Promise.all(destinations.map(resolveDestination));
  const inboxes = uris.reduce((acc, cur) => new Set([...acc, ...cur]));

  // TODO: Support sharedInbox https://www.w3.org/TR/activitypub/#shared-inbox-delivery
  const completionPromises = [...inboxes].map(inbox => postObject(inbox, activity));

  // TODO: Handle failed federation POSTs using the returnedboolean array
  await Promise.all(completionPromises);
};

const saveObject = async (object:ObjectBase):Promise<?string> => {
  // TODO: Implement the rest of the relevant object types
  let createdObject:?ObjectBase;
  switch (object.type.toLowerCase()) {
  case 'event': {
    createdObject = await (new Event(object)).save();
    break;
  }
  }
  return createdObject ? String(createdObject.id) : null;
};

// Given a URI, resolves with target endpoint
// until a list of inbox URIs is generated
const resolveDestination = async (to:string): Promise<Set<string>> => {
  if (!to) {
    return new Set();
  }

  if (to === 'https://www.w3.org/ns/activitystreams#Public' || to === 'Public' || to === 'as:Public') {
    // This is addressed to the public special collection https://www.w3.org/TR/activitypub/#public-addressing
    // TODO: Handle this somehow?
    return new Set();
  }

  const object = await getObject(to);
  if (!object) {
    // TODO: Support retrying of failed resolutions
    return new Set();
  }

  if (object.inbox) {
    // We found an Actor.
    return new Set([ object.inbox ]);
  }

  if ([ 'Collection', 'OrderedCollection', 'CollectionPage', 'OrderedCollectionPage' ].includes(object.type)) {
    // We found a list of stuff. Resolve each
    // TODO: guard against stack overflows
    const items = object.items || object.orderedItems || [];
    if (object.next) {
      items.push(object.next);
    }
    else if (object.first) {
      items.push(object.first);
    }
    if (items.length === 0) {
      return new Set();
    }
    const uris = await Promise.all<Set<string>>(items.map(resolveDestination));
    return uris.reduce((acc, cur) => new Set([...acc, ...cur]));
  }

  // Dunno what this is
  return new Set();
};

export const renderCollection = (id:string, items:Array<*>):Object => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "Collection",
  "totalItems": items.length,
  "items": items
});

export const renderOrderedCollection = (id:string, items:Array<*>):Object => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "OrderedCollection",
  "totalItems": items.length,
  "orderedItems": items
});

const getUrlForId = (id:string):string => {
  const domain = process.env.DOMAIN;
  if (domain && id.startsWith(domain)) {
    // Local object, so point at the local server
    return `http://api:8080${id.substring(domain.length)}`;
  }
  return id;
};

export const getObject = async (id:string | Object): Promise<?any> => {

  if (typeof id === 'object') {
    return id;
  }

  // TODO: Request-level cacheing to prevent redundant fetch or db lookups
  let res = null;
  try {
    res = await fetch(getUrlForId(id), {
      method: 'GET',
      headers: {
        // TODO: authentication?
        'Accept': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams'
      }
    });
  } catch(e) {
    // Request failed, so it's not okay
  }
  if (!res || !res.ok) {
    return null;
  }
  return res.json();
};

const postObject = async (to, object): Promise<boolean> => {
  const res = await fetch(getUrlForId(to), {
    method: 'POST',
    headers: {
      // TODO: authentication?
      'Content-Type': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
    },
    body: JSON.stringify(object)
  });
  return res.ok;
};
