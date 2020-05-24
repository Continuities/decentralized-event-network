/**
 * Misc util functions
 * @author mtownsend
 * @since May 2020
 * @flow
 */

export const splitOnce = (input:string, divider:string):Array<string> => {
  const i = input.indexOf(divider);
  if (i < 0) {
    return [ input ];
  }
  return [
    input.substring(0, i),
    input.substring(i + 1)
  ];
};
