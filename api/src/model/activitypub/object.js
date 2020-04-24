/**
 * Base schema for all ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from 'mongoose';

export class Object$Schema<C:Object$Document> extends Mongoose.Schema<C> {
  constructor(obj:any, options:any) {
    super(obj, options);
    this.add({
      '@context': [ String ],
      id: { type: String, unique: true, index: true },
      type: String,
      name: String,
      attributedTo: String,
      content: String,
      summary: String,
      published: Date,
      updated: Date,
      startTime: Date,
      endTime: Date,
      image: String,
      location: String,
      audience: String,
      to: { type: [ String ], default: undefined },
      bto: { type: [ String ], default: undefined },
      cc: { type: [ String ], default: undefined },
      bcc: { type: [ String ], default: undefined },
    });
    this.pre('save', function() {
      this['@context'] = [
        'https://www.w3.org/ns/activitystreams'
      ];
    });
  }
}

export class Object$Document /* :: extends Mongoose$Document */ {
  id: string | number;
  type: string;
  name: ?string;
  attributedTo: ?string;
  content: ?string;
  summary: ?string;
  published: ?string;
  updated: ?string;
  startTime: ?string;
  endTime: ?string;
  image: ?string;
  location: ?string;
  audience: ?string;
  to: ?Array<string>;
  bto: ?Array<string>;
  cc: ?Array<string>;
  bcc: ?Array<string>;
}
