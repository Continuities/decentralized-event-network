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

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));

const Home = ({ user }: { user: string }) => {
  const styles = useStyles();
  return (
    <React.Fragment>
      {user}&apos;s homepage.
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