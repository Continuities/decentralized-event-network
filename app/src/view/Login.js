/**
  * Main view for authentication
  * @author mtownsend
  * @since April 2020
  * @flow
  */

import React from 'react';
import VerticalColumn from './VerticalColumn';
import { useCoreStyles } from '../core-styles';
import ProgressButton from './ProgressButton';
import { 
  Container,
  Card,
  CardContent,
  TextField,
  Typography,
  Box
} from '@material-ui/core';

const Login = () => {
  const styles = useCoreStyles();
  return (
    <Container className={styles.fullHeight} maxWidth="xs">
      <VerticalColumn className={styles.fullHeight}>
        <Card>
          <CardContent>
            <VerticalColumn center>
              <Typography gutterBottom variant="h5" component="h2">
                Sign In
              </Typography>
              <LoginForm />
            </VerticalColumn>
          </CardContent>
        </Card>
      </VerticalColumn>
    </Container>
  );
}

const LoginForm = () => (
  <form noValidate>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="email"
      label="Email Address"
      name="email"
      autoComplete="email"
      autoFocus
    />
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type="password"
      id="password"
      autoComplete="current-password"
    />
    <Box mt={4}>
      <ProgressButton
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        Sign In
      </ProgressButton>
    </Box>
  </form>
);

export default Login;