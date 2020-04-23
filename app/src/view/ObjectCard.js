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
import type { ApiObject } from '../controller/UserProvider';


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
  object: ApiObject
|};

// TODO: Support other relevant object types
const ObjectCard = ({ object }: P) => {
  const styles = useStyles();
  return (
    <Card>
      <Box className={styles.media}>
        <EventIcon style={{ fontSize: 70 }}/>
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          { object.name }
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Starts {timeString(object.start)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Ends {timeString(object.end)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ObjectCard;