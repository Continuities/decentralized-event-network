/**
 * Base schema for all ActivityPub objects
 * @author mtownsend
 * @since April 2020
 * @flow
 */

/* Tell Flow that this extends Mongoose$Document when 
 * it's in scope (for the API), but ignore it when 
 * it isn't (for the app) */
// $FlowFixMe
class Object /* :: extends Mongoose$Document */ {
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

export default Object;
