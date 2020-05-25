/**
 * Handles data retrieval for WebFinger requests
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import { getActor } from './user.js';
import { splitOnce } from '../util.js';

type FingerLink = {|
  rel: string,
  type?: string,
  href?: string,
  template?: string
|};

type FingerIdentity = {|
  subject: string,
  aliases: Array<string>,
  links: Array<FingerLink>
|};

export const getIdentity = async (resourceUri:string): Promise<?FingerIdentity> => {

  const localDomain = process.env.DOMAIN 
    ? process.env.DOMAIN.split('://')[1] 
    : '';

  const [ resourceType, resourceId ] = splitOnce(resourceUri, ':');
  if (resourceType !== 'acct' || !resourceId) {
    // Only support acct lookup for now
    return null;
  }

  const [ username, domain ] = splitOnce(resourceId, '@');
  if (!username || domain !== localDomain) {
    // Can't be looked up here
    return null;
  }

  const actor = await getActor(username);
  if (!actor) {
    // Doesn't exist
    return null;
  }

  return {
    subject: resourceUri,
    aliases: [ String(actor.id) ],
    links: [{
      rel: 'http://webfinger.net/rel/profile-page',
      type: 'text/html',
      href: String(actor.id)
    }, {
      rel: 'self',
      type: 'application/activity+json',
      href: String(actor.id)
    }]
  };
};
