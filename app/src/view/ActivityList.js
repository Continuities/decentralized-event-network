/**
 * Displays a list of activities
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { List, ListItem } from '@material-ui/core';
import Activity from './Activity';

type P = {|
  activities: Array<api$Activity>
|};

const ActivityList = ({ activities, ...props }: P) => {
  return (
    <List {...props}>
      { activities.map(a => (
        <ListItem disableGutters key={Math.random()}>
          <Activity activity={a} />
        </ListItem>
      ))}
    </List>
  )
};

export default ActivityList;
