/**
 * Button for displaying followstate and allowing un/follow actions
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import {
  IconButton,
  CircularProgress
} from '@material-ui/core';
import {
  PersonAdd, PersonAddDisabled
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useRemoteState } from '../controller/ApiProvider';

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
  username: string,
  followState: ?api$FollowState
|};

const FollowButton = ({ username, followState }: P) => {
  
  if (!followState) {
    // Falsey followstate means following is impossible
    // Don't show the button.
    return null;
  }

  const styles = useStyles();
  const [ following, setFollowing ] = useRemoteState(`user/${username}/follow`, followState === 'following');

  return (
    <div className={styles.container}>
      <IconButton
        aria-label={following ? 'unfollow' : 'follow'}
        color="primary"
        disabled={following.loading}
        onClick={() => setFollowing(!following.value)}
      >
        {following.value ? <PersonAddDisabled /> : <PersonAdd />}
      </IconButton>
      {following.loading && <CircularProgress className={styles.progress} />}
    </div>
  );
};

export default FollowButton;
