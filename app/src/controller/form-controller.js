/**
 * General controller for making forms submittable
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { useState } from 'react';
import { merge } from '../util';

type FormControls = {|
  values: FormValues,
  errors: FormErrors,
  responseCode?: number,
  onChange: FormTarget => void,
  onSubmit: Event => void,
  isSubmitting: boolean
|};
export type $FormController = () => FormControls;
type FormTarget = { target: HTMLInputElement };
export type FormValues = {
  [string]: string
};
export type FormErrors = {
  [string]: string
};

const FormController = (method:string, endpoint:string, onSuccess:() => void, initialValues:FormValues = {}):$FormController => (
  () => {
    const [ state, setState ] = useState({ values: initialValues, errors: {}, isSubmitting: false });

    const onChange = ({ target }: FormTarget) => {
      const newValues = merge(state.values, { [target.name]: target.value });
      setState(merge(state, { values: newValues }));
    };

    const onSubmit = (e:Event) => {
      e.preventDefault();
      fetch(buildEndpoint(endpoint, state.values), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.values)
      }).then(async res => {
        if (res.ok) {
          setState({ values: {}, errors: {}, isSubmitting: false });
          onSuccess();
          return;
        }
        if (res.status === 422) {
          // Handle server-side validation errors
          const body = await res.json();
          const errors = {};
          if (body.errors) {
            for (let err of body.errors) {
              errors[err.param] = err.msg;
            }
          }
          setState(merge(state, { isSubmitting: false, errors }));
          return;
        }
        setState(merge(state, { responseCode: res.status, isSubmitting: false }));
      });
      setState(merge(state, { isSubmitting: true, errors: {}, responseCode: null }));
    }

    return merge(state, { onChange, onSubmit });
  }
);

const buildEndpoint = (tmpl, values) => {
  const parts = tmpl.split('/');
  return parts.map(p => p.startsWith(':') ? values[p.substring(1)] : p).join('/');
};

export const nilControls:FormControls = {
  values: {}, 
  errors: {},
  onChange: () => {}, 
  onSubmit: () => {}, 
  isSubmitting: false
}

export default FormController;

