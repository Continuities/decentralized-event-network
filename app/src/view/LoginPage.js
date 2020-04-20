/**
  * Main view for authentication
  * @author mtownsend
  * @since April 2020
  * @flow
  */

import React from 'react';
import VerticalColumn from './VerticalColumn';
import { useCoreStyles } from '../core-styles';
import LoginForm from './LoginForm';
import FormController from '../controller/FormController';
import { useAuth } from '../controller/AuthProvider';
import { navigate, Redirect } from '@reach/router';
import { Link } from '../controller/RouterLink';
import { 
  Container,
  Card,
  CardContent,
  Typography,
  Box
} from '@material-ui/core';

const Login = () => {
  const styles = useCoreStyles();
  const [ auth, setAuth ] = useAuth();
  const formController = FormController(
    'POST', 
    '/api/user/token',
    res => {
      navigate('/home');
      setAuth(res.token)
    }
  );
  if (auth) {
    return <Redirect to='/home' noThrow />;
  }
  return (
    <Container className={styles.fullHeight} maxWidth="xs">
      <VerticalColumn className={styles.fullHeight}>
        <Card>
          <CardContent>
            <VerticalColumn center>
              <Typography gutterBottom variant="h5" component="h2">
                Sign In
              </Typography>
              <LoginForm controller={formController} />
              <Box mt={2}>
                <Link to='/register'>Don&apos;t have an account?</Link>
              </Box>
            </VerticalColumn>
          </CardContent>
        </Card>
      </VerticalColumn>
    </Container>
  );
};

export default Login;