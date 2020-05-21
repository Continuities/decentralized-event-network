/**
 * Models an ActivityPub Activity object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import ObjectBase from './object.js';
import Actor from './actor.js';

class Activity extends ObjectBase {
  actor: string | $Shape<Actor>;
  object: string | $Shape<ObjectBase> | $Shape<Activity>;
}

export default Activity;
