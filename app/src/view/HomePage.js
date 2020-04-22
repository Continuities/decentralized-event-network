/**
 * Main lander page for logged in users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { useAuth } from '../controller/AuthProvider';
import { navigate, Redirect } from '@reach/router';
import NavigationFrame from './NavigationFrame';
import jwtDecode from 'jwt-decode';
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

const Home = () => {
  const [ auth, ] = useAuth();
  const styles = useStyles();
  if (!auth) {
    return <Redirect to='/login' noThrow />;
  }
  return (
    <NavigationFrame title={jwtDecode(auth).username}>
      <Fab 
        className={styles.fab} 
        aria-label="Create event"
        onClick={() => navigate('/create')}
      >
        <AddIcon />
      </Fab>
    </NavigationFrame>
  );
};

export default Home;