/**
 * Provides data related to Events
 * @author mtownsend
 * @since May 2020
 * @flow
 */
import React from 'react';
import { useData } from './ApiProvider';
import FourOhFour from '../view/FourOhFour';

import type { GetData } from './ApiProvider';

type HOC<C: React$ComponentType<*>> = (C) => React$ComponentType<React$ElementConfig<C>>

export const withEvent = <C: React$ComponentType<*>>(eventId:?string):HOC<C> => (Component:C) => 
  (props:React$ElementConfig<C>) => {
    if (!eventId) {
      return <FourOhFour />
    }
    const data:GetData<api$Event> = useData(`event/${eventId}`);
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

    return <Component {...props} event={data}/>;
  };
