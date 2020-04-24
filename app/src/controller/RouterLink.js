/**
 * Material-UI themed Router links
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { useMemo, forwardRef } from 'react';
import { Link as RouterLink } from '@reach/router';
import { Link as UILink } from '@material-ui/core';

type P = {
  to: string
};

export const routed = (Component:Class<React$Component<any>>) => {
  const RoutedComponent = ({ to, ...props }: P) => {
    const CustomLink = useMemo(
      () =>
        forwardRef(function innerLink(linkProps, ref) { 
          return <RouterLink ref={ref} to={to} {...linkProps} />
        }),
      [ to ]
    );
    return (
      <Component {...props} component={CustomLink} />
    );
  };
  return RoutedComponent;
};

export const Link = routed(UILink);
