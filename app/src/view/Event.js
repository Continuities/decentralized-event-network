/**
 * An event's public profile
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withActivities, useEventOutbox } from '../controller/UserProvider';
import ActivityList from './ActivityList';
import ObjectCard from './ObjectCard';

type P = {
  event: api$Event
};

const useStyles = makeStyles(() => ({
  feed: {
    
  }
}));

const Event = ({ event }: P) => {
  const styles = useStyles
  const FeedList = withActivities(useEventOutbox.bind(null, event.id))(ActivityList);
  return (
    <React.Fragment>
      <ObjectCard object={ event } />
      <FeedList className={styles.feed} />
    </React.Fragment>
  );
}

export default Event;
