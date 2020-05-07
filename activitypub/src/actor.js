/**
 * Models an ActivityPub Actor object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import ObjectBase from './object.js';

class Actor extends ObjectBase {
  preferredUsername: string;
  inbox: string;
  outbox: string;
  followers: string;
  following: string;
  publicKey: {
    id: string,
    owner: string,
    publicKeyPem: string
  };
}

export default Actor;
