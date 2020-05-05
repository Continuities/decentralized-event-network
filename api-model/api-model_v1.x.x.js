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

declare type api$JoinActivity = {|
  type: 'Join',
  object: api$Event,
  ...BaseActivity
|};

declare type api$FollowActivity = {|
  type: 'Follow',
  object: api$User,
  ...BaseActivity
|};

declare type api$CreateActivity = {|
  type: 'Create',
  object: api$Event,
  ...BaseActivity
|};

declare type api$Activity =  api$FollowActivity | api$CreateActivity | api$JoinActivity;

declare type api$Event = {|
  type: 'Event',
  id: string,
  name: string,
  url: string,
  host: api$User,
  start: string,
  end: string,
  attending: boolean
|};

// TODO: Disjoint union when we add more object types
declare type api$Object = api$Event | api$User;
