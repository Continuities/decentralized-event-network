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
import { useAttendingToggle } from '../service/Api';
import { useObject } from '../controller/ObjectProvider';
import { getUserId, getEventUid } from '../service/ActivityPub';

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
  const { token, username } = useAuth();
  const setAttending = useAttendingToggle(getEventUid(eventId));
  
  const attendingId = !username ? null : `${getUserId(username)}/attending`;
  const attending = useObject<Collection<Actor>>(attendingId);
  if (!attending || !username || !token || !attendingId) {
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
