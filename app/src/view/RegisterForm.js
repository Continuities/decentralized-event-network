/**
 * Simple registration form
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import ControllableForm from './ControllableForm';

import type { $FormController } from '../controller/FormController';

const fields = [{
  name: 'username',
  label: 'Username',
  required: true,
  pattern: ['\\w*', 'Letters, numbers, and underscores only.']
}, {
  name: 'email',
  label: 'Email Address',
  required: true,
  autoComplete: 'email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  autoComplete: 'current-password'
}, {
  name: 'password-confirm',
  label: 'Confirm Password',
  type: 'password',
  required: true
}];

type P = {|
  controller?:$FormController
|};

const LoginForm = ({ controller }:P) => (
  <ControllableForm controller={controller} fields={fields} submitLabel="Sign Up"/>
);

export default LoginForm;