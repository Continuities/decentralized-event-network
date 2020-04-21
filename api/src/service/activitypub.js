/**
 * Service for manipulating ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { Actor, Event } from '../model/activitypub.js';

export const getActorId = (username:string) => {
  return `${process.env.DOMAIN || ''}/user/${username}`;
};

export const createActor = async (name:string, pubKey:string) => {
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
  // TODO: Create hosting relationship
  // TODO: Push a Create Activity into user's Outbox
  return new Event({
    name,
    startTime: start.toISOString(),
    endTime: end.toISOString()
  }).save();
};