/**
 * Main application
 * Defines core styles and routing
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { Router } from "@reach/router";
import Home from './HomePage';
import Login from './LoginPage';
import Register from './RegisterPage';
import FourOhFour from './FourOhFour';
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

const useStyles = makeStyles(theme => ({
  main: {
    padding: theme.spacing(2, 0),
    height: '100%',
    '& > div': { // Reach Router injects an unstylable div =(
      height: '100%'
    }
  }
}));

const App = () => {
  const styles = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <Container 
        className={styles.main} 
        component="main" 
        maxWidth="sm"
      >
        <CssBaseline />
        <Router>
          <Home path="/home" />
          <Login path="/login" />
          <Register path="/register" />
          <FourOhFour default />
        </Router>
      </Container>
    </ThemeProvider>
  );
}

export default App;