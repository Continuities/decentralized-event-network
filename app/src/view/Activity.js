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
    <Typography variant="caption">
      <ProfileLink user={activity.user} />
      {` posted on ${timestamp(activity.published)}`}
    </Typography>
    <ObjectCard object={activity.object} />
  </Box>
);

const FollowActivity = ({ activity }: { activity: api$FollowActivity }) => (
  <Box width="100%">
    <Typography variant="caption">
      <ProfileLink user={activity.user} />
      {` followed `} 
      <ProfileLink user={activity.object} /> 
      {` on ${timestamp(activity.published)}`}
    </Typography>
  </Box>
);

const Activity = ({ activity }:P) => {
  
  switch (activity.type) {
  case 'Create': return <CreateActivity activity={activity} />
  case 'Follow': return <FollowActivity activity={activity} />
  }

  return null;
};

export default Activity;
