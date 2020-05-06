/**
 * Renders an ActivityPub Activity
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import {
  Box,
  Typography
} from '@material-ui/core';
import { Activity } from 'activitypub';
import ProfileLink from './ProfileLink';
import ObjectCard from './ObjectCard';

const timestamp = (dateString:?string) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

type P = {|
  activity: Activity
|};

const CreateActivity = ({ activity }:P) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.actor} />
      {` posted`}
    </Typography>
    {typeof activity.object === 'object' && <ObjectCard object={activity.object} />}
  </Box>
);

const FollowActivity = ({ activity }: { activity: Activity }) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.actor} />
      {` followed `} 
      {typeof activity.object === 'object' &&  <ProfileLink object={activity.object} />}
    </Typography>
  </Box>
);

const JoinActivity = ({ activity }: { activity: Activity }) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.actor} />
      {` is attending`} 
    </Typography>
    {typeof activity.object === 'object' && <ObjectCard object={activity.object} />}
  </Box>
);

const ActivityView = ({ activity }: P) => {
  if (typeof activity.actor === 'string') {
    // This should have been populated by ObjectProvider
    return null;
  }

  switch (activity.type) {
  case 'Create': return <CreateActivity activity={activity} />
  case 'Follow': return <FollowActivity activity={activity} />
  case 'Join': return <JoinActivity activity={activity} />
  }

  return null;
};

export const isRenderableActivity = (activity:Activity) => {
  return [ 'Create', 'Follow', 'Join' ].indexOf(activity.type) >= 0;
};

export default ActivityView;
