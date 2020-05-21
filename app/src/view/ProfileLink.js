/**
 * Formatted link to user profile
 * Could have hover effects, etc...
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { Link } from '../controller/RouterLink';
import { Link as ExternalLink } from '@material-ui/core';
import { Actor, Event } from 'activitypub';

type P = {|
  object: string | Event | Actor
|};

const ProfileLink = ({ object }: P) => {
  if (typeof object === 'string') {
    // Maybe fetch this if it's not populated? Dunno.
    return null;
  }
  const localDomain = `${window.location.protocol}//${window.location.host}`;
  const url = String(object.id);
  if (!url.startsWith(localDomain)) {
    // This is a remote profile
    return (
      <ExternalLink href={url}>
        {object.name}
      </ExternalLink>
    );
  }
  const internalUrl = object instanceof Actor ? url : object.type === 'Event' ? `/event/${object.id}` : `/user/${object.name}`;
  return (
    <Link color="textPrimary" to={internalUrl}>
      {object.name}
    </Link>
  );
};

export default ProfileLink;
