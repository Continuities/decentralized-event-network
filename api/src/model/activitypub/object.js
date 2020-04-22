/**
 * Base schema for all ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from 'mongoose';

export class Object$Schema extends Mongoose.Schema<any> {
  constructor(obj:any, options:any) {
    super(obj, options);
    this.add({
      '@context': [ String ],
      id: { type: String, unique: true, index: true },
      type: String
    });
    this.pre('save', function() {
      this['@context'] = [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1'
      ];
    });
  }
}

export class Object$Document /* :: extends Mongoose$Document */ {
  id: string | number;
  type: string;
}