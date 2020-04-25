// @flow

// TODO: Support requested state
declare type api$FollowState = 
  'following' | 
  'can-follow';

declare type api$User = {|
  type: 'Person',
  name: string,
  url: string,
  following:?api$FollowState
|};

type BaseActivity = {|
  url: string,
  user: api$User,
  published: string
|};

declare type api$FollowActivity = {|
  type: 'Follow',
  object: api$User,
  url: string,
  user: api$User,
  published: string
|};

declare type api$CreateActivity = {|
  type: 'Create',
  object: api$Event,
  url: string,
  user: api$User,
  published: string
|};

declare type api$Activity =  api$FollowActivity | api$CreateActivity;

declare type api$Event = {|
  type: 'Event',
  name: string,
  host: api$User,
  start: string,
  end: string
|};

// TODO: Disjoint union when we add more object types
declare type api$Object = api$Event | api$User;
