/* eslint-disable no-unused-vars */
/**
 * A user's public profile
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import CollectionView from './CollectionView';
import ProfileCard from './ProfileCard';

import { Actor, Activity, OrderedCollection } from 'activitypub';
import { useObject } from '../controller/ObjectProvider';

type P = {
  userId: string
};

const Profile = ({ userId }: P) => {
  const [ user ] = useObject<Actor>(userId);
  const [ outbox ] = useObject<OrderedCollection<Activity>>(user ? user.outbox : null);

  return (
    <React.Fragment>
      { !user ? 'LOADING...' : <ProfileCard user={ user } /> }
      { !outbox ? 'LOADING...' : <CollectionView data={outbox} /> }
    </React.Fragment>
  );
}

export default Profile;
