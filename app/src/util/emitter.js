/**
 * Simple single-event emitter
 * @author mtownsend
 * @since May 2020
 * @flow
 */

type Listener<T> = T => void;
export type Emitter<T> = {
  addListener: Listener<T> => void,
  removeListener: Listener<T> => void
};

const makeEmitter = <T> ():[ Emitter<T>, T => void ] => {
  const listeners:Array<Listener<T>> = [];
  
  const addListener = (listener:Listener<T>) => {
    listeners.push(listener);
  };

  const removeListener = (listener:Listener<T>) => {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };

  const emit = (event:T) => {
    listeners.forEach(listener => listener(event));
  };

  return [{
    addListener,
    removeListener
  }, emit];
};

export default makeEmitter;
