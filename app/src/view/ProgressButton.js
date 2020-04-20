/**
 * Button with a progress state
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import {
  Box,
  Button,
  LinearProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { cls } from '../util';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative'
  },
  progressBar: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    width: '90%',
    marginTop: -2
    // marginLeft: -12,
  },
  hideable: {
    opacity: 1,
    transition: `opacity ${theme.transitions.duration.standard}ms`,
  },
  hidden: {
    pointerEvents: 'none',
    opacity: 0
  }
}));

type P = {
  progress?:boolean,
  children: React$Node
};

const ProgressButton = ({ progress, children, ...props }: P) => { 
  const styles = useStyles();
  return (
    <Box className={styles.wrapper}>
      <Button {...props} disabled={progress}>
        <Box className={cls(styles.hideable, progress && styles.hidden)}>
          {children}
        </Box>
      </Button>
      <LinearProgress className={cls(styles.progressBar, styles.hideable, !progress && styles.hidden)} />
    </Box>
  );
};

export default ProgressButton;