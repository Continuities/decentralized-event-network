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
import FormController from '../controller/form-controller';
import { navigate } from '@reach/router';
import { 
  Container,
  Card,
  CardContent,
  Typography
} from '@material-ui/core';

const Login = () => {
  const styles = useCoreStyles();
  const formController = FormController(
    'POST', 
    '/api/user/token',
    () => navigate('/home')
  );
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
            </VerticalColumn>
          </CardContent>
        </Card>
      </VerticalColumn>
    </Container>
  );
}

export default Login;