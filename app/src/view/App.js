/**
 * Main application
 * Defines core styles and routing
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { Router, Redirect } from "@reach/router";
import AuthProvider, { useAuth } from '../controller/AuthProvider';
import ObjectProvider, { useObject } from '../controller/ObjectProvider';
import Home from './HomePage';
import Login from './LoginPage';
import Register from './RegisterPage';
import CreateEvent from './CreateEvent';
import FourOhFour from './FourOhFour';
import Profile from './Profile';
import Event from './Event';
import { parseQueryString } from '../util/util';
import NavigationFrame from './NavigationFrame';
import { 
  makeStyles, 
  createMuiTheme, 
  ThemeProvider 
} from '@material-ui/core/styles';
import { 
  Container,
  CssBaseline
} from '@material-ui/core';

const theme = createMuiTheme({
  palette: { type: 'dark' }
});

const useStyles = makeStyles(() => ({
  main: {
    height: '100%',
    '& > div': { // Reach Router injects an unstylable div =(
      height: '100%'
    }
  }
}));

const BaseRoute = () => {
  const { token } = useAuth();
  return <Redirect noThrow to={token ? '/home' : '/login'} />;
};

const App = () => {
  const styles = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ObjectProvider>
          <CssBaseline />
          <NavigationFrame>
            <Container 
              className={styles.main} 
              component="main" 
              maxWidth="sm"
            >
              <Router>
                <BaseRoute path="/" />
                <Home path="/home" />
                <Login path="/login" />
                <Register path="/register" />
                <CreateEvent path="/create" />
                {/* TODO: Why this no work? */}
                <AtUser path="/@:username" />
                <APProfilePage path="/user/:username" />
                <ProfilePage path="/user" />
                <EventPage path="/event/:eventId" />
                <FourOhFour default />
              </Router>
            </Container>
          </NavigationFrame>
        </ObjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AtUser = ({ username }: {username?: string }) => (
  <Redirect to={`/user/${username || ''}`} noThrow />
);

const ProfilePage = ({ location }: any) => {
  const actorId = parseQueryString(location.search).get('id');
  if (!actorId) {
    return <FourOhFour />;
  }
  return <Profile userId={actorId} />;
};

const APProfilePage = ({ username }: { username?: string }) => {
  if (!username || !process.env.DOMAIN) {
    return <FourOhFour />;
  }

  const id = `${process.env.DOMAIN}/user/${username}`;
  return <Profile userId={id} />;
};

const EventPage = ({ eventId }: {eventId?: string }) => {
  if (!eventId || !process.env.DOMAIN) {
    return <FourOhFour />;
  }
  const id = `${process.env.DOMAIN}/event/${eventId}`;
  const event = useObject(id);
  return event == null ? null : <Event event={event} />;
};

export default App;
