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
  user: api$User
|};

const ProfileLink = ({ user }: P) => {
  const localDomain = `${window.location.protocol}//${window.location.host}/user/`;
  if (!user.url.startsWith(localDomain)) {
    // This is a remote profile
    return (
      <ExternalLink to={user.url}>
        {user.name}
      </ExternalLink>
    );
  }
  return (
    <Link to={`/user/${user.name}`}>
      {user.name}
    </Link>
  );
};

export default ProfileLink;
