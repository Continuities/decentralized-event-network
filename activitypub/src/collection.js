/**
 * Models an ActivityPub Collection
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import ObjectBase from './object.js';

class Collection<T:ObjectBase> extends ObjectBase {
  totalItems: number;
  current: string;
  first: string;
  last: string;
  items: Array<T | string>
}

export default Collection;
