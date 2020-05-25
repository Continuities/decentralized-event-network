/**
 * Material-UI themed Router links
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { useMemo, forwardRef } from 'react';
import { Link as RouterLink } from '@reach/router';
import { 
  Link as UILink,
  ListItem
} from '@material-ui/core';

type P = {
  to: string
};

export const routed = (Component:Class<React$Component<any>>) => {
  const RoutedComponent = ({ to, ...props }: P) => {
    const localDomain = `${window.location.protocol}//${window.location.host}`;
    if (to.startsWith(localDomain)) {
      to = to.substring(localDomain.length);
    }
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
export const ListItemLink = routed(ListItem);


