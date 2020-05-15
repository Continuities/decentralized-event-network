/**
 * Button for displaying attendance and allowing un/join actions
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import {
  IconButton
} from '@material-ui/core';
import {
  PlusOne, ExposureNeg1
} from '@material-ui/icons';
import { useAuth } from '../controller/AuthProvider';
import { makeStyles } from '@material-ui/core/styles';
import { setAttendingState } from '../controller/ApiProvider';
import { useObject } from '../controller/ObjectProvider';

import type { Collection, Actor } from 'activitypub';

const useStyles = makeStyles(() => ({
  container: {
    position: 'relative'
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  }
}));

type P = {|
  eventId: string
|};

const AttendButton = ({ eventId }: P) => {

  const styles = useStyles();
  const [ auth, user ] = useAuth();
  
  // TODO: Move id resolution further up the logical chain
  const attendingId = !process.env.DOMAIN || !user ? null : `${process.env.DOMAIN}/user/${user}/attending`;

  const [ attending, refreshAttending ] = useObject<Collection<Actor>>(attendingId);
  if (!attending || !user || !auth || !attendingId) {
    return null;
  }

  let isAttending = false;
  for (let item of attending.items) {
    if (typeof item === 'string' && item === eventId || 
        typeof item !== 'string' && item.id === eventId) {
      isAttending = true;
      break;
    }
  }

  const setAttending = async (attend:boolean) => {
    // TODO: Do this with client-server publishing instead of the API
    const eventUid = eventId.substring(eventId.lastIndexOf('/') + 1);
    await setAttendingState(auth, eventUid, attend);
    // TODO: This is giving the handshake time to complete on the backend
    // Doing this without magic numbers would be nice
    setTimeout(refreshAttending, 200);
  };

  return (
    <div className={styles.container}>
      <IconButton
        aria-label={!isAttending ? 'attend' : 'unattend'}
        color="primary"
        onClick={() => setAttending(!isAttending)}
      >
        {isAttending ? <ExposureNeg1 /> : <PlusOne />}
      </IconButton>
    </div>
  );
};

export default AttendButton;
