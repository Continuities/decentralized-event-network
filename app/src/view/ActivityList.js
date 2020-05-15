/**
 * Renders an OrderedCollection of Activities
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import { List, ListItem } from '@material-ui/core';
import ActivityView, { isRenderableActivity } from './ActivityView';
import { Activity, OrderedCollection } from 'activitypub';

const mergeOrderedActivities = (listA:Array<Activity>, listB:Array<Activity>) => {
  const merged = [];
  
  let ai = 0, bi = 0;
  while (ai < listA.length) {
    const da = new Date(listA[ai].published || 0);
    while(bi < listB.length) {
      if (listB[bi].id === listA[ai].id) {
        bi++;
        continue;
      }
      const db = new Date(listB[bi].published || 0);
      if (db < da) { break; }
      merged.push(listB[bi++]);
    }
    merged.push(listA[ai++]);
  }
  if (bi < listB.length) {
    merged.push(...listB.slice(bi));
  }

  return merged;
};

type P = {|
  data: OrderedCollection<Activity>,
  merge?:?OrderedCollection<Activity>
|};

const ActivityList = ({ data, merge }: P) => {
  if (!data) {
    return null;
  }

  // $FlowFixMe Flow is bad at filter https://github.com/facebook/flow/issues/1414
  const activities:Array<Activity> = data.orderedItems.filter(i => typeof i !== 'string');
  // $FlowFixMe Flow is bad at filter https://github.com/facebook/flow/issues/1414
  const mergeActivities:Array<Activity> = merge ? merge.orderedItems.filter(i => typeof i !== 'string') : [];

  const items = mergeOrderedActivities(activities, mergeActivities);

  return (
    <List>
      { items.map(a => {
        if (typeof a === 'string') {
          return null;
        }
        return isRenderableActivity(a) && (
          <ListItem key={String(a.id)}>
            <ActivityView activity={a} />
          </ListItem>
        );
      })}
    </List>
  );
};

export default ActivityList;
