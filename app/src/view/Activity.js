/* eslint-disable no-unused-vars */ // TODO
/**
 * View representing an Activity
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { 
  Box,
  Typography
} from '@material-ui/core';
import ProfileLink from './ProfileLink';
import ObjectCard from './ObjectCard';

type P = {|
  activity: api$Activity
|};

const timestamp = (dateString:string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

const CreateActivity = ({ activity }:P) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.user} />
      {` posted`}
    </Typography>
    <ObjectCard object={activity.object} />
  </Box>
);

const FollowActivity = ({ activity }: { activity: api$FollowActivity }) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.user} />
      {` followed `} 
      <ProfileLink object={activity.object} /> 
    </Typography>
  </Box>
);

const JoinActivity = ({ activity }: { activity: api$JoinActivity }) => (
  <Box width="100%">
    <Typography display="block" variant="caption">
      {timestamp(activity.published)}
    </Typography>
    <Typography variant="caption">
      <ProfileLink object={activity.user} />
      {` is attending`} 
    </Typography>
    <ObjectCard object={activity.object} />
  </Box>
);

const Activity = ({ activity }:P) => {
  
  switch (activity.type) {
  case 'Create': return <CreateActivity activity={activity} />
  case 'Follow': return <FollowActivity activity={activity} />
  case 'Join': return <JoinActivity activity={activity} />
  }

  return null;
};

export default Activity;
