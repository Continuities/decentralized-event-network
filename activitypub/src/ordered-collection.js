/**
 * Models an ActivityPub OrderedCollection
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import ObjectBase from './object.js';

class OrderedCollection<T:ObjectBase> extends ObjectBase {
  totalItems: number;
  current: string;
  first: string;
  last: string;
  orderedItems: Array<T | string>
}

export default OrderedCollection;
