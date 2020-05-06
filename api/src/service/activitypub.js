/**
 * Service for manipulating ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Event, Activity } from '../model/activitypub.js';
import { 
  getActor, 
  getActivity, 
  getFollowers, 
  getFollowing,
  getOutbox 
} from './user.js';
import { 
  getEvent, 
  getEventId,
  getOutbox as getEventOutbox,
  getActivity as getEventActivity
} from './event.js';
import { getActorId } from './user.js';

import { 
  Inbox, 
  Outbox, 
  Follower,
  Attendee
} from '../model/api.js';
import uuid from 'short-uuid';
import fetch from 'node-fetch';

import type { Object$Document } from '../model/activitypub.js';

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
      toOutbox(actorId, {
        type: 'Accept',
        actor: actorId,
        to: [ activity.actor ],
        object: activity
      });
      await addFollower(
        actorId,
        activity.actor
      );
    }
    break;
  }
  case 'join': {
    // Same request/response pattern as follow
    if (activity.object === actorId) {
      toOutbox(actorId, {
        type: 'Accept',
        actor: actorId,
        to: [ activity.actor ],
        object: activity
      });
      await addAttendee(
        actorId,
        activity.actor
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

const saveObject = async (object:Object$Document):Promise<?string> => {
  // TODO: Implement the rest of the relevant object types
  let createdObject:?Object$Document;
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

const renderCollection = (id:string, items:Array<*>):Object => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "Collection",
  "totalItems": items.length,
  "items": items
});

const renderOrderedCollection = (id:string, items:Array<*>):Object => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "OrderedCollection",
  "totalItems": items.length,
  "orderedItems": items
});

// TODO: Not sure I like this pattern. Feels like a shitty replacement
// for express routes, and I'm losing Flow typing.
export const getObject = async (id:string | Object): Promise<?any> => {

  if (typeof id === 'object') {
    return id;
  }

  // TODO: Request-level cacheing to prevent redundant fetch or db lookups

  const domain = process.env.DOMAIN;
  if (!domain || !id.startsWith(domain)) {
    // Remote object, so fetch it
    let res = null;
    try {
      res = await fetch(id, {
        method: 'GET',
        headers: {
          // TODO: authentication?
          'Accept': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams'
        }
      });
    } catch {
      // Request failed, so it's not okay
    }
    if (!res || !res.ok) {
      return null;
    }
    return res.json();
  }

  // This is a local object, so fetch it locally
  // TODO: Make a nicer abstraction for this
  if (id.endsWith('/')) {
    id = id.substring(0, id.length - 1);
  }
  const [ ctrl, ...rest] = id.substring(domain.length + 1).split('/');
  if (ctrl === 'user') {
    if (rest.length === 1) {
      // User request
      return getActor(rest[0]);
    }
    else if (rest.length === 2 && rest[1] === 'followers') {
      // Followers request
      return renderCollection(id, await getFollowers(rest[0]));
    }
    else if (rest.length === 2 && rest[1] === 'following') {
      // Following request
      return renderCollection(id, await getFollowing(rest[0]));
    }
    else if (rest.length === 2 && rest[1] === 'outbox') {
      // User outbox request
      return renderOrderedCollection(id, await getOutbox(rest[0]));
    }
    else if (rest.length === 3 && rest[1] === 'activities') {
      // Activity request
      return getActivity(rest[0], rest[2]);
    }
  }
  else if (ctrl === 'event') {
    if (rest.length === 1) {
      // Event request
      return getEvent(rest[0]);
    }
    else if (rest.length === 2 && rest[1] === 'outbox') {
      // Event outbox request
      return renderOrderedCollection(id, await getEventOutbox(rest[0]));
    }
    else if (rest.length === 3 && rest[1] === 'activities') {
      // Activity request
      return getEventActivity(rest[0], rest[2]);
    }
  }

  // Don't know what it is
  return null;
};

const postObject = async (to, object): Promise<boolean> => {
  const domain = process.env.DOMAIN;
  if (!domain || !to.startsWith(domain)) {
    // Remote endpoint, so POST it
    const res = await fetch(to, {
      method: 'POST',
      headers: {
        // TODO: authentication?
        'Content-Type': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams'
      },
      body: JSON.stringify(object)
    });
    return res.ok;
  }

  // This is a local endpoint, so save it locally
  // TODO: Make a nicer abstraction for this
  const [ ctrl, ...rest] = to.substring(domain.length + 1).split('/');
  if (rest.length === 2 && rest[1] === 'inbox') {
    // Posting to inbox
    let actorId;
    if (ctrl === 'user') {
      actorId = getActorId(rest[0]);
    }
    else if (ctrl === 'event') {
      actorId = getEventId(rest[0]);
    }
    else {
      return false;
    }
    await toInbox(actorId, object);
    return true;
  }

  // Unsupported endpoint
  return false;
};
