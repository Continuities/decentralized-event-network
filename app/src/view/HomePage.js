/**
 * Main lander page for logged in users
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { useAuth } from '../controller/AuthProvider';
import { Redirect } from '@reach/router';
import jwtDecode from 'jwt-decode';

const Home = () => {
  const [ auth, ] = useAuth();
  if (!auth) {
    return <Redirect to='/login' noThrow />;
  }
  return (
    <div>Welcome home {jwtDecode(auth).username}</div>
  );
};

export default Home;