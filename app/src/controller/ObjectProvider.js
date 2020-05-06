/**
 * Global pass-through object cache
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React, { useReducer, useEffect, useContext, createContext } from 'react';
import { useAuth } from './AuthProvider';
import { ObjectBase } from 'activitypub';

type ObjectId = string;
type ObjectCache = {
  [ObjectId]: any
};

type ObjectContextType = [ ObjectCache, (UpdateAction) => void ];
const ObjectContext = createContext<ObjectContextType>([ {}, () => {} ]);

type P = {|
  children: React$Node
|};

type UpdateAction = {|
  type: 'update',
  newCache: ObjectCache
|};

const cacheReducer = (cache, action) => {
  if (action.type === 'update') {
    const updatedCache = { ...cache, ...action.newCache };
    console.log('Updated object cache', updatedCache);
    return updatedCache;
  }
  return cache;
};

const ObjectProvider = ({ children }: P) => {
  const [ cache, dispatch ] = useReducer<ObjectCache, UpdateAction>(cacheReducer, {});

  return (
    <ObjectContext.Provider value={[ cache, dispatch ]}>
      {children}
    </ObjectContext.Provider>
  );
};

// TODO: This code has turned to spaghetti. Clean it up.
export const useObject = <T:ObjectBase> (objectId:?string):[ ?T, () => Promise<void> ] => {
  const [ cache, dispatch ] = useContext(ObjectContext);
  const [ auth, ] = useAuth();

  const doFetch = async (signal, uri:string) => {

    const headers:{ [string]: string } = {
      'Accept': 'application/ld+json'
    };

    if (auth) {
      headers.Authorization = `Bearer ${auth}`
    }
    const res = await fetch(uri, { headers, signal });
    if (!res.ok) {
      console.error(`Couldn't fetch ${uri} ${res.status} ${res.statusText}`);
      return;
    }
    return res.json();
  };

  const fromPassthroughCache = async (signal, uri:?string, refetch = false):Promise<[any, ObjectCache]> => {

    const newCache:ObjectCache = {};

    if (!uri) { return [ null, newCache ]; }

    // If it's in the cache, don't fetch it
    if (cache[uri] && !refetch) {
      return [ null, newCache ];
    }

    // fetch and store the requested object first
    const object = await doFetch(signal, uri);
    if (!object) { return [ null, newCache ]; }

    const resolveChild = async (value: any | string) => {
      // If the child is an id, fetch it
      let child = null, childCache = {};
      if (typeof value === 'string') {
        [ child, childCache ] = await fromPassthroughCache(signal, value);
      }
      else if (value && value.id) {
        child = value;
        await processObject(child);
        newCache[child.id] = child;
      }
      // Merge in the new objects from child resolution
      Object.assign(newCache, childCache);

      return child;
    };

    const processObject = async (toProcess) => {
      // Crawl its nested objects
      for (let key of [ 'object', 'actor', 'attributedTo' ]) {
        const child = await resolveChild(toProcess[key]);
        // Replace with a reference
        if (child && child.id) {
          toProcess[key] = child.id;
        }
      }
      const items = toProcess.items || toProcess.orderedItems;
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          const child = await resolveChild(items[i]);
          // Replace with a reference
          if (child && child.id) {
            items[i] = child.id;
          }
        }
      }
    };

    await processObject(object);

    newCache[uri] = object;

    return [ object, newCache ];
  };

  const fetchObject = async (signal, refetch = false) =>
    fromPassthroughCache(signal, objectId, refetch).then(([ , newCache ]) => {
      dispatch({
        type: 'update',
        newCache
      });
    });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetchObject(signal);
    return () => { controller.abort(); };
  }, [ objectId ]);


  const populateChildren = (toPopulate) => {
    if (toPopulate) {
      for (let key of [ 'object', 'actor', 'attributedTo' ]) {
        if (typeof toPopulate[key] === 'string' && cache[toPopulate[key]]) {
          // Populate from cache if we can
          const cached = deepCopy(cache[toPopulate[key]]);
          populateChildren(cached);
          toPopulate[key] = cached;
        }
      }
      const items = toPopulate.items || toPopulate.orderedItems;
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          if (typeof items[i] === 'string' && cache[items[i]]) {
            const cached = deepCopy(cache[items[i]]);
            populateChildren(cached);
            items[i] = cached;
          }
        }
      }
    }
  };
  
  const typed:?T = objectId && cache[objectId] 
    ? (deepCopy(cache[objectId]):T) 
    : null;
  
  populateChildren(typed);

  return [ typed, fetchObject.bind(null, null, true) ];
};

const deepCopy = (o) => JSON.parse(JSON.stringify(o));

export default ObjectProvider;
