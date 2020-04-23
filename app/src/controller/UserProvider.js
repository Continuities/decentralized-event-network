/**
 * Provides data related to users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { useData } from './ApiProvider';
import FourOhFour from '../view/FourOhFour';

import type { ApiData } from './ApiProvider';

export type ProfileData = {
  name: string,
  displayName: string
};

type HOC<C: React$ComponentType<*>> = (C) => React$ComponentType<React$ElementConfig<C>>

export const withProfile = <C: React$ComponentType<*>>(username:?string):HOC<C> => (Component:C) => 
  (props:React$ElementConfig<C>) => {
    if (!username) {
      return <FourOhFour />
    }
    const data:ApiData<ProfileData> = useData(`/user/${username}`);
    if (data === 'LOADING') {
      return <div>LOADING...</div>;
    }
    if (data === 404) {
      return <FourOhFour />
    }
    if (typeof data === 'number') {
      // TODO: Fancy error page
      return <div>{`ERROR ${data}`}</div>;
    }

    return <Component {...props} profile={data}/>;
  };