/**
 * Vertical column of elements
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { Grid } from '@material-ui/core';


type MaybeArray = React$Element<any> | Array<React$Element<any>>;
type P = {|
  children: MaybeArray,
  center?: boolean,
  className?: string
|};

const maybeMap = (stuff:MaybeArray, map:React$Element<any>=>React$Element<any>) => {
  return Array.isArray(stuff) ? stuff.map(map) : map(stuff);
}

const VerticalGrid = ({ children, center, className }:P) => (
  <Grid container
    direction="column"
    justify="center"
    alignItems={center && 'center'}
    className={className}
  >
    {maybeMap(children, (child, i) => (
      <Grid item 
        key={i} 
        xs={12}
        style={{ flexBasis: 'unset' }}
      >
        {child}
      </Grid>
    ))}
  </Grid>
);

export default VerticalGrid;
