/**
 * Button for displaying followstate and allowing un/follow actions
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import {
  IconButton
} from '@material-ui/core';
import {
  PersonAdd, PersonAddDisabled
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from '../controller/AuthProvider';
import { useObject } from '../controller/ObjectProvider';
import { useFollowToggle } from '../service/Api';
import { Actor, Collection } from 'activitypub';
import { getUserId, getUsername } from '../service/ActivityPub';

const useStyles = makeStyles(() => ({
  container: {
    position: 'relative'
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  }
}));

type P = {|
  userId: string
|};

const FollowButton = ({ userId }: P) => {
  const styles = useStyles();
  const { token, username } = useAuth();
  const setFollowing = useFollowToggle(getUsername(userId));
  
  const followingId = !username ? null : `${getUserId(username)}/following`;
  const following = useObject<Collection<Actor>>(followingId);

  if (!following || !username || !token) {
    return null;
  }

  let isFollowing = false;
  for (let item of following.items) {
    if (typeof item === 'string' && item === userId || 
        typeof item !== 'string' && item.id === userId) {
      isFollowing = true;
      break;
    }
  }

  return (
    <div className={styles.container}>
      <IconButton
        aria-label={isFollowing ? 'unfollow' : 'follow'}
        color="primary"
        onClick={() => setFollowing(!isFollowing)}
      >
        {isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
      </IconButton>
    </div>
  );
};

export default FollowButton;
