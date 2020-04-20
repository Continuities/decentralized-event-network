/**
 * Generic controllable form
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { 
  TextField, 
  Typography,
  Box 
} from '@material-ui/core';
import ProgressButton from './ProgressButton';
import { nilControls } from '../controller/FormController';

import type { $FormController } from '../controller/FormController';

type FormField = {|
  name:string,
  label:string,
  type?:string,
  required?:boolean,
  autoComplete?:string,
  pattern?:[ string, string ],
|};

type P = {|
  fields: Array<FormField>,
  submitLabel: string,
  controller?: $FormController
|};

const ControllableForm = ({ submitLabel, fields, controller }: P) => {
  const { 
    values,
    errors,
    responseCode,
    onChange, 
    onSubmit, 
    isSubmitting 
  } = controller ? controller() : nilControls;
  return (
    <form onSubmit={onSubmit}>
      {fields.map(f => (
        <TextField
          key={f.name}
          variant="outlined"
          margin="normal"
          required={f.required}
          fullWidth
          name={f.name}
          label={f.label}
          type={f.type}
          value={values[f.name] || ''}
          onChange={onChange}
          autoComplete={f.autoComplete}
          error={!!errors[f.name]}
          helperText={errors[f.name]}
          inputProps={f.pattern && { pattern: f.pattern[0], title: f.pattern[1] }}
        />
      ))}
      { responseCode === 401 && <Typography align="center" color="error">Incorrect username or password</Typography> }
      <Box mt={4}>
        <ProgressButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          progress={isSubmitting}
        >
          {submitLabel}
        </ProgressButton>
      </Box>
    </form>
  );
};

export default ControllableForm;