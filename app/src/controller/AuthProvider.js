/**
 * Context provider for authorization
 * TODO: Persist auth in localstorage
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { createContext, useContext, useState } from 'react';
import { Redirect } from '@reach/router';
import jwtDecode from 'jwt-decode';

const STORAGE_KEY = 'auth';

type AuthContextType = [ ?string, (?string) => void ];
const AuthContext = createContext<AuthContextType>([ null, () => {} ]);

type P = {|
  children: React$Node
|};

const AuthProvider = ({ children }: P) => {
  const [ auth, setAuth ] = useState(localStorage.getItem(STORAGE_KEY));
  const set = token => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    }
    else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setAuth(token);
  };
  return (
    <AuthContext.Provider value={[ auth, set ]}>
      { children }
    </AuthContext.Provider>
  );
};

export const useAuth = ():AuthContextType => useContext(AuthContext);

export const requireUser = <Com: React$ComponentType<*>>(Component:Com) => 
  (props:React$ElementConfig<Com>) => {
    const [ auth, ] = useAuth();
    if (!auth) {
      return <Redirect to='/login' />
    }
    return <Component {...props} user={jwtDecode(auth).username}/>;
  };

export default AuthProvider;