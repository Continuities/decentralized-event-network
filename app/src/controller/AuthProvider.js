/**
 * Context provider for authorization
 * TODO: Persist auth in localstorage
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { createContext, useContext, useState } from 'react';

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

export default AuthProvider;