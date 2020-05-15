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
import { useObject } from '../controller/ObjectProvider';
import FourOhFour from './FourOhFour';
import ActivityList from './ActivityList';
import { Actor, OrderedCollection, Activity } from 'activitypub';

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));

type P = {
  username: string
};

const Home = ({ username }: P) => {
  const styles = useStyles();

  if (!username || !process.env.DOMAIN) {
    return <FourOhFour />;
  }

  const userId = `${process.env.DOMAIN}/user/${username}`;

  const [ user ] = useObject<Actor>(userId);
  const [ outbox ] = useObject<OrderedCollection<Activity>>(user ? user.outbox : null);
  const [ inbox ] = useObject<OrderedCollection<Activity>>(user ? user.inbox : null);

  return (
    <React.Fragment>
      {outbox == null ? 'LOADING...' : <ActivityList data={outbox} merge={inbox}/>}
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
