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
import ObjectCard from './ObjectCard';

import type { ApiActivity } from '../controller/UserProvider';

type P = {|
  activity: ApiActivity
|};

const verbMap = {
  'Create': 'posted'
  // TODO: Support other relevant activities
};

const timestamp = (dateString:string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

const Activity= ({ activity }:P) => (
  <Box width="100%">
    <Typography>{`${activity.user.name} ${verbMap[activity.type]} on ${timestamp(activity.published)}`}</Typography>
    <ObjectCard object={activity.object} />
  </Box>
);

export default Activity;