/**
 * Main lander page for logged in users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { requireUser } from '../controller/AuthProvider';
import { navigate } from '@reach/router';
import { Fab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Add as AddIcon } from '@material-ui/icons';
import { withActivities, useFeed } from '../controller/UserProvider';
import ActivityList from './ActivityList';

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));

const Home = () => {
  const styles = useStyles();

  const FeedList = withActivities(useFeed)(ActivityList);

  return (
    <React.Fragment>
      <FeedList />
      <Fab 
        className={styles.fab} 
        aria-label="Create event"
        onClick={() => navigate('/create')}
      >
        <AddIcon />
      </Fab>
    </React.Fragment>
  );
};

export default requireUser(Home);