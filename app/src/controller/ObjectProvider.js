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

const CachePopulator = () => {

  const fetching:Set<string> = new Set();

  const doFetch = async (uri:string, auth:?string, signal:?AbortSignal) => {

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

  const populate = async (cache:ObjectCache, uri:?string, auth:?string, signal:?AbortSignal, refetch = false):Promise<[any, ObjectCache]> => {
    const newCache:ObjectCache = {};

    if (!uri) { return [ null, newCache ]; }

    // If it's in the cache or already being fetched, don't fetch it
    if ((cache[uri] && !refetch) || fetching.has(uri)) {
      return [ null, newCache ];
    }

    // fetch and store the requested object
    fetching.add(uri);
    const object = await doFetch(uri, auth, signal);
    if (!object) { return [ null, newCache ]; }

    const resolveChild = async (value: any | string) => {
      // If the child is an id, populate it from the remote source
      let child = null, childCache = {};
      if (typeof value === 'string') {
        [ child, childCache ] = await populate(cache, value, auth, signal, refetch);
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

  const clearFetching = (uris:Array<string>) => 
    uris.forEach(uri => fetching.delete(uri));

  return [ populate, clearFetching ];
};

// TODO: This code has turned to spaghetti. Clean it up.
const [ populateCache, markFetched ] = CachePopulator();
export const useObject = <T:ObjectBase> (objectId:?string):[ ?T, () => Promise<void> ] => {
  const [ cache, dispatch ] = useContext(ObjectContext);
  const [ auth, ] = useAuth();

  const fetchObject = async (signal:?AbortSignal, refetch = false) => {
    populateCache(cache, objectId, auth, signal, refetch).then(([ , newCache ]) => {
      dispatch({
        type: 'update',
        newCache
      });
      markFetched(Object.keys(newCache));
    });
  }

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
