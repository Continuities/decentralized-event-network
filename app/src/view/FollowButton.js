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
import { setFollowState } from '../controller/ApiProvider';
import { Actor, Collection } from 'activitypub';

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
  userId: ?string
|};

const FollowButton = ({ userId }: P) => {
  const styles = useStyles();
  const [ auth, user ] = useAuth();
  
  // TODO: Move id resolution further up the logical chain
  const followingId = !process.env.DOMAIN || !user ? null : `${process.env.DOMAIN}/user/${user}/following`;
  const [ following, refreshFollowing ] = useObject<Collection<Actor>>(followingId);

  if (!following || !userId || !user || !auth) {
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

  const setFollowing = async (follow:boolean) => {
    // TODO: Do this with client-server publishing instead of the API
    const followName = userId.substring(userId.lastIndexOf('/') + 1);
    await setFollowState(auth, followName, follow);
    // TODO: This is giving the handshake time to complete on the backend
    // Doing this without magic numbers would be nice
    setTimeout(refreshFollowing, 200);
  };

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
