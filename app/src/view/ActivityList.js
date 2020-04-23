/**
 * Displays a list of activities
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { List, ListItem } from '@material-ui/core';
import Activity from './Activity';

import type { ApiActivity } from '../controller/UserProvider';

type P = {|
  activities: Array<ApiActivity>
|};

const ActivityList = ({ activities }: P) => {
  return (
    <List>
      { activities.map(a => (
        <ListItem key={Math.random()}>
          <Activity activity={a} />
        </ListItem>
      ))}
    </List>
  )
};

export default ActivityList;