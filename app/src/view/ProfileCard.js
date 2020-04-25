/**
 * Card representing a user profile
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
import { 
  Face as FaceIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import FollowButton from './FollowButton';

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
  user: api$User
|};

const ProfileCard = ({ user }: P) => {
  const styles = useStyles();
  return (
    <Card>
      <Box className={styles.media}>
        <FaceIcon style={{ fontSize: 70 }}/>
      </Box>
      <CardContent>
        <Typography 
          className={styles.title}
          gutterBottom 
          variant="h5" 
          component="h2"
        >
          { user.name }
          <FollowButton username={user.name} followState={user.following}  />
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
