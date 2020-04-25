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


const timeString = (dateString:string) => {
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
  }
}));

type P = {|
  object: api$Object
|};

const EventCard = ({ event }: { event: api$Event }) => {
  const styles = useStyles();
  return (
    <Card>
      <Box className={styles.media}>
        <EventIcon style={{ fontSize: 70 }}/>
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          { event.name }
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Starts {timeString(event.start)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Ends {timeString(event.end)}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ObjectCard = ({ object }: P) => {
  switch (object.type) {
  case 'Event': return <EventCard event={(object:api$Event)} />
  // TODO: Support other relevant object types
  }
  return null;
}

export default ObjectCard;
