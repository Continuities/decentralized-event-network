/**
 * Utility functions that don't have another homea
 * @author mtownsend
 * @since April 2020
 * @flow
 */

export const cls = (...classes:Array<?(string | boolean)>):string => {
  return classes.filter(c => !!c).join(' ');
};

export const merge = (a:Object, b:Object):Object => Object.assign({}, a, b);


export const delay = (millis:number):Promise<void> => 
  new Promise((resolve) => {
    setTimeout(() => resolve(), millis);
  });

export const bisect = (input:string, sep:string):[string, string] => {
  const i = input.indexOf(sep);
  if (i < 0) {
    return [ input, '' ];
  }
  return [
    input.substring(0, i),
    input.substring(i + 1)
  ];
};

export const parseQueryString = (queryString:?string):Map<string, string> => {
  if (!queryString) {
    return new Map();
  }
  if (queryString.startsWith('?')) {
    queryString = queryString.substring(1);
  }
  return new Map(queryString.split('&').map(pair => bisect(pair, '=')));
};
