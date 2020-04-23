/**
 * A user's public profile
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import type { ProfileData } from '../controller/UserProvider';

type P = {
  profile: ProfileData
};

const Profile = ({ profile }: P) => {

  return (
    <div>
      <div>TODO: {profile.name}&apos;s profile</div>
      <div>TODO: Display outbox</div>
    </div>
  );
}

export default Profile;