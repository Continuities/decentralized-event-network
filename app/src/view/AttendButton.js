/**
 * Button for displaying attendance and allowing un/join actions
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React from 'react';
import {
  IconButton,
  CircularProgress
} from '@material-ui/core';
import {
  PlusOne, ExposureNeg1
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useRemoteState } from '../controller/ApiProvider';

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
  eventId: string,
  attending: boolean
|};

const AttendButton = ({ eventId, attending }: P) => {

  const styles = useStyles();
  const [ attendingData, setAttendingData ] = useRemoteState(`event/${eventId}/join`, attending);

  return (
    <div className={styles.container}>
      <IconButton
        aria-label={attendingData.value ? 'attend' : 'unattend'}
        color="primary"
        disabled={attendingData.loading}
        onClick={() => setAttendingData(!attendingData.value)}
      >
        {attendingData.value ? <ExposureNeg1 /> : <PlusOne />}
      </IconButton>
      {attendingData.loading && <CircularProgress className={styles.progress} />}
    </div>
  );
};

export default AttendButton;
