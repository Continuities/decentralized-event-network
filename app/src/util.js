/**
 * Utility functions that don't have another homea
 * @author mtownsend
 * @since April 2020
 * @flow
 */

export const cls = (...classes:Array<?(string | boolean)>):string => {
  return classes.filter(c => !!c).join(' ');
};