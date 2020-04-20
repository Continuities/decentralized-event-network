/**
 * Main lander page for logged in users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { useAuth } from '../controller/AuthProvider';
import { Redirect } from '@reach/router';
import NavigationFrame from './NavigationFrame';
import jwtDecode from 'jwt-decode';

const Home = () => {
  const [ auth, ] = useAuth();
  if (!auth) {
    return <Redirect to='/login' noThrow />;
  }
  return (
    <NavigationFrame>
      Welcome home {jwtDecode(auth).username}
    </NavigationFrame>
  );
};

export default Home;