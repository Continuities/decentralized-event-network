/**
 * Context provider for authorization
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { createContext, useContext, useState } from 'react';
import { Redirect } from '@reach/router';
import jwtDecode from 'jwt-decode';

const STORAGE_KEY = 'auth';

type AuthContextType = {|
  token: ?string,
  username: ?string,
  setToken: ?string => void
|};

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  setToken: () => {}
});

type P = {|
  children: React$Node
|};

const AuthProvider = ({ children }: P) => {
  const [ token, setToken ] = useState(localStorage.getItem(STORAGE_KEY));
  const set = t => {
    if (t) {
      localStorage.setItem(STORAGE_KEY, t);
    }
    else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setToken(t);
  };
  const username = token && jwtDecode(token).username;
  return (
    <AuthContext.Provider value={{ token, username, setToken: set }}>
      { children }
    </AuthContext.Provider>
  );
};

export const useAuth = ():AuthContextType => useContext(AuthContext);

export const requireUser = <Com: React$ComponentType<*>>(Component:Com) => 
  (props:React$ElementConfig<Com>) => {
    const { token, username } = useAuth();
    if (!token) {
      return <Redirect to='/login' noThrow />
    }
    return <Component {...props} username={username}/>;
  };

export default AuthProvider;
