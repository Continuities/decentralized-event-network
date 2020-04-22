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

export const localISODate = () => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
};