/**
 * Main application
 * Defines core styles and routing
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { Router, Redirect } from "@reach/router";
import jwtDecode from 'jwt-decode';
import AuthProvider, { useAuth } from '../controller/AuthProvider';
import { withProfile } from '../controller/UserProvider';
import { withEvent } from '../controller/EventProvider';
import Home from './HomePage';
import Login from './LoginPage';
import Register from './RegisterPage';
import CreateEvent from './CreateEvent';
import FourOhFour from './FourOhFour';
import Profile from './Profile';
import Event from './Event';
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
  const [ auth, ] = useAuth();
  return <Redirect noThrow to={auth ? '/home' : '/login'} />;
};

const Main = ({ children }: { children: React$Node }) => {
  const [ auth, ] = useAuth();

  if (auth) {
    return (
      <NavigationFrame title={jwtDecode(auth).username}>
        {children}
      </NavigationFrame>
    );
  }

  return children;
};

const App = () => {
  const styles = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <Main>
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
              <ProfilePage path="/user/:username" />
              <EventPage path="/event/:eventId" />
              <FourOhFour default />
            </Router>
          </Container>
        </Main>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AtUser = ({ username }: {username?: string }) => (
  <Redirect to={`/user/${username || ''}`} noThrow />
);

const ProfilePage = ({ username }: { username?: string }) => {
  const Page = withProfile(username)(Profile);
  return <Page />;
};

const EventPage = ({ eventId }: {eventId?: string }) => {
  const Page = withEvent(eventId)(Event);
  return <Page />;
};

export default App;
