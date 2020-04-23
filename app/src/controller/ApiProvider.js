/**
 * Logic for requesting data from the backend api
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

type FetchError = number;

type FetchState = 'LOADING' | FetchError;

export type ApiData<T> = FetchState | T;

export const useData = <T>(endpoint:string): ApiData<T> => {
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