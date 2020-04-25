/**
 * Logic for requesting data from the backend api
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

type GetError = number;
type GetState = 'LOADING' | GetError;
export type GetData<T> = GetState | T;

type PostState<T> = {|
  loading: boolean,
  value:T
|};

export const useRemoteState = <T>(endpoint:string, initialValue:T): [ PostState<T>, T => Promise<void> ] => {
  const [ state, setState ] = useState({ loading: false, value: initialValue });
  const [ auth, ] = useAuth();

  const setRemote = async (value:T) => {
    const headers:{ [string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (auth) {
      headers.Authorization = `Bearer ${auth}`
    }

    setState({ loading: true, value: state.value });

    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ value })
    });

    if (!res.ok) {
      setState({ loading: false, value: state.value });
      return;
    }

    const json = await res.json();
    
    setState({ loading: false, value: json.value });
  };

  return [ state, setRemote ];
};

export const useData = <T>(endpoint:string): GetData<T> => {
  const [ data, setData ] = useState('LOADING');
  const [ auth, ] = useAuth();

  const fetchData = async () => {
    const headers:{ [string]: string } = {
      'Accept': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
    };

    if (auth) {
      headers.Authorization = `Bearer ${auth}`
    }

    const res = await fetch(`/api/${endpoint}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      setData(res.status);
      return;
    }
    
    setData(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, [ endpoint, auth ]);

  return data;
};
