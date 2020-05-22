/**
 * An event's public profile
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import ObjectCard from './ObjectCard';
import { 
  Event, 
  Activity, 
  OrderedCollection 
} from 'activitypub';
import { useObject } from '../controller/ObjectProvider';
import ActivityList from './ActivityList';

type P = {
  event: Event
};

const EventView = ({ event }: P) => {
  const outbox = useObject<OrderedCollection<Activity>>(event.outbox);
  return (
    <React.Fragment>
      <ObjectCard object={ event } />
      { !outbox ? 'LOADING...' : <ActivityList data={outbox} /> }
    </React.Fragment>
  );
}

export default EventView;
