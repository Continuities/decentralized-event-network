// @flow

declare type api$User = {|
  name: string,
  url: string
|};

declare type api$Activity = {|
  type: string,
  url: string,
  user: api$User,
  published: string,
  object: api$Object
|};

declare type api$Event = {|
  type: 'Event',
  name: string,
  host: api$User,
  start: string,
  end: string
|};

// TODO: Disjoint union when we add more object types
declare type api$Object = api$Event;
