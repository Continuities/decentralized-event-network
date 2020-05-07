/**
 * ActivityPub event object
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import Object from './object.js';

class Event extends Object {
  inbox: string;
  outbox: string;
}

export default Event;
