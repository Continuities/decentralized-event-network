/**
 * Simple login form
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import ControllableForm from './ControllableForm';

import type { $FormController } from '../controller/form-controller';

const fields = [{
  name: 'user',
  label: 'Username or Email',
  required: true,
  autoComplete: 'email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  autoComplete: 'current-password'
}];

type P = {|
  controller?:$FormController
|};

const LoginForm = ({ controller }:P) => (
  <ControllableForm controller={controller} fields={fields} submitLabel="Sign In"/>
);

export default LoginForm;