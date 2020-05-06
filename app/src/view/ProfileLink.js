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

type P = {|
  object: api$User | api$Event
|};

const ProfileLink = ({ object }: P) => {
  const localDomain = `${window.location.protocol}//${window.location.host}`;
  if (!object.url.startsWith(localDomain)) {
    // This is a remote profile
    return (
      <ExternalLink href={object.url}>
        {object.name}
      </ExternalLink>
    );
  }
  const url = object.type === 'Event' ? `/event/${object.id}` : `/user/${object.name}`;
  return (
    <Link color="textPrimary" to={url}>
      {object.name}
    </Link>
  );
};

export default ProfileLink;
