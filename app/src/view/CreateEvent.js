/**
 * Main view for event creation
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import VerticalColumn from './VerticalColumn';
import { useCoreStyles } from '../core-styles';
import EventForm from './EventForm';
import FormController from '../controller/FormController';
import { Link } from '../controller/RouterLink';
import { requireUser } from '../controller/AuthProvider';
import { navigate } from '@reach/router';
import { localISODate } from '../util';
import { 
  Container,
  Card,
  CardContent,
  Typography,
  Box
} from '@material-ui/core';

const CreateEvent = ({ user }: { user: string }) => {
  const styles = useCoreStyles();

  const formController = FormController(
    'PUT', 
    `/api/user/${user}/event`,
    () => {
      navigate('/home');
    },
    {
      start: localISODate(),
      end: localISODate()
    }
  );
  return (
    <Container className={styles.fullHeight} maxWidth="xs">
      <VerticalColumn className={styles.fullHeight}>
        <Card>
          <CardContent>
            <VerticalColumn center>
              <Typography gutterBottom variant="h5" component="h2">
                New Event
              </Typography>
              <EventForm controller={formController} />
              <Box mt={2}>
                <Link to='/home'>Cancel</Link>
              </Box>
            </VerticalColumn>
          </CardContent>
        </Card>
      </VerticalColumn>
    </Container>
  );
}

export default requireUser(CreateEvent);