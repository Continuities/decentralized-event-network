/**
 * Card representing an ActivityPub object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography
} from '@material-ui/core';
import { Event as EventIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from '../controller/RouterLink';
import AttendButton from './AttendButton';
import { ObjectBase, Event } from 'activitypub';

const timeString = (dateString:?string) => {
  if (!dateString) { return null; }
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

const useStyles = makeStyles((theme) => ({
  media: {
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.action.hover
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));

type P = {|
  object: ObjectBase
|};

const EventCard = ({ event }: { event: Event }) => {
  const styles = useStyles();
  return (
    <Card>
      <Box className={styles.media}>
        <EventIcon style={{ fontSize: 70 }}/>
      </Box>
      <CardContent>
        <Typography className={styles.title} gutterBottom variant="h5" component="h2">
          <Link to={String(event.id)} color="textPrimary">
            { event.name }
          </Link>
          <AttendButton eventId={String(event.id)} />
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Starts {timeString(event.startTime)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Ends {timeString(event.endTime)}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ObjectCard = ({ object }: P) => {
  switch (object.type) {
  case 'Event': return <EventCard event={(object:Event)} />
  // TODO: Support other relevant object types
  }
  return null;
}

export default ObjectCard;
