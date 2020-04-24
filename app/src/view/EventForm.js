/**
 * Form for event creation/modification
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import ControllableForm from './ControllableForm';

import type { $FormController } from '../controller/FormController';

const fields = [{
  name: 'name',
  label: 'Event Name',
  required: true,
}, {
  name: 'start',
  label: 'Start Time',
  type: 'datetime-local',
  required: true
}, {
  name: 'end',
  label: 'End Time',
  type: 'datetime-local',
  required: true
}];

type P = {|
  controller?:$FormController
|};

const LoginForm = ({ controller }:P) => (
  <ControllableForm controller={controller} fields={fields} submitLabel="Create"/>
);

export default LoginForm;
