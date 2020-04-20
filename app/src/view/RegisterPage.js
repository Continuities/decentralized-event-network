/**
  * Main view for registration
  * @author mtownsend
  * @since April 2020
  * @flow
  */

import React from 'react';
import VerticalColumn from './VerticalColumn';
import { useCoreStyles } from '../core-styles';
import RegisterForm from './RegisterForm';
import FormController from '../controller/form-controller';
import { navigate } from '@reach/router';
import { 
  Container,
  Card,
  CardContent,
  Typography
} from '@material-ui/core';

const Register = () => {
  const styles = useCoreStyles();
  const formController = FormController(
    'PUT', 
    '/api/user/:username',
    () => navigate('/login')
  );
  return (
    <Container className={styles.fullHeight} maxWidth="xs">
      <VerticalColumn className={styles.fullHeight}>
        <Card>
          <CardContent>
            <VerticalColumn center>
              <Typography gutterBottom variant="h5" component="h2">
                Sign Up
              </Typography>
              <RegisterForm controller={formController} />
            </VerticalColumn>
          </CardContent>
        </Card>
      </VerticalColumn>
    </Container>
  );
}

export default Register