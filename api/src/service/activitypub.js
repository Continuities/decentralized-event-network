/**
 * Service for manipulating ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Event, Activity, Object$Document } from '../model/activitypub.js';
import { getActor, getActivity, getFollowers, getOutbox } from './user.js';
import { getEvent } from './event.js';
import { getActorId } from './user.js';

import { Inbox, Outbox } from '../model/api.js';
import uuid from 'short-uuid';
import fetch from 'node-fetch';

export const getActivityId = (user:string, uuid:string) => {
  return `${getActorId(user)}/activities/${uuid}`
};

// TODO: Support other relevant Activity types
type ActivityJson = {
  type: "Create",
  object: string | ObjectJson
} & Object;

// TODO: Support other relevant Object types
type ObjectJson = {
  type: "Event",
  id: string
} & Object;

export const toInbox = async (username:string, activity:ActivityJson) => {
  // TODO: Handle forward-from-inbox https://www.w3.org/TR/activitypub/#inbox-forwarding
  // TODO: Possibly store local copies of external activities?
  let dbActivity = await Activity.findOne({ id: activity.id });
  if (!activity.id.startsWith(process.env.DOMAIN)) {
    // Store a copy the first time we see a remote activity
    dbActivity = await new Activity(activity).save();
  }
  if (!dbActivity) {
    // This means it's a local activity that isn't stored.
    // This shouldn't happen, so just abort.
    throw 'Non-existent local activity delivered to an invox =/';
  }
  const entry = new Inbox({
    to: getActorId(username),
    published: dbActivity.published,
    activity: dbActivity._id
  });
  return entry.save();
};

// Submit an activity to an actor's outbox. Currently called by the REST api
// during POST, but could be easily modified to allow direct client-server ActivityPub
export const toOutbox = async (username:string, activity:ActivityJson):Promise<void> => {
  // TODO: Validate that the activity's actor matches the username
  activity.id = getActivityId(username, uuid.generate());
  let createdActivity;
  switch (activity.type.toLowerCase()) {
  case 'create': {
    // Replace the object in the activity with a reference
    if (typeof activity.object === 'object') {
      const newObject = await saveObject(activity.object);
      if (!newObject) { return; }
      activity.object = newObject;
      createdActivity = await new Activity(activity).save();
    }
    break;
    // TODO: Implement the rest of the relevant activity types
  }}

  if (!createdActivity) {
    return;
  }

  await new Outbox({
    from: getActorId(username),
    published: createdActivity.published,
    activity: createdActivity._id
  }).save();

  return publish(activity);
};

const publish = async (activity:ActivityJson):Promise<void> => {

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

const saveObject = async (object:ObjectJson):Promise<?string> => {
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
    const uris = await Promise.all<Set<string>>(items.map(resolveDestination));
    return uris.reduce((acc, cur) => new Set([...acc, ...cur]));
  }

  // Dunno what this is
  return new Set();
};

const renderCollection = (id:string, items:Array<string>) => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "Collection",
  "totalItems": items.length,
  "items": items
});

const renderOrderedCollection = (id:string, items:Array<string>) => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": id,
  "type": "OrderedCollection",
  "totalItems": items.length,
  "orderedItems": items
});

export const getObject = async (id:string): Object | null => {
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
    else if (rest.length === 2 && rest[1] === 'outbox') {
      // User outbox request
      return renderOrderedCollection(id, await getOutbox(rest[0]));
    }
    else if (rest.length === 3 && rest[1] === 'activities') {
      // Activity request
      return getActivity(rest[0], rest[2]);
    }
  }
  else if (ctrl === 'event' && rest.length === 1) {
    // Event request
    return getEvent(rest[0]);
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
  if (ctrl === 'user' && rest.length === 2 && rest[1] === 'inbox') {
    // Posting to inbox
    await toInbox(rest[0], object);
    return true;
  }

  // Unsupported endpoint
  return false;
};
