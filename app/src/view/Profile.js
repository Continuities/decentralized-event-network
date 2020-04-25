/**
 * A user's public profile
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withActivities, useOutbox } from '../controller/UserProvider';
import ActivityList from './ActivityList';
import ProfileCard from './ProfileCard';

type P = {
  profile: api$User
};

const useStyles = makeStyles(() => ({
  feed: {
    
  }
}));

const Profile = ({ profile }: P) => {
  const styles = useStyles
  const FeedList = withActivities(useOutbox.bind(null, profile.name))(ActivityList);
  return (
    <React.Fragment>
      <ProfileCard user={ profile } />
      <FeedList className={styles.feed} />
    </React.Fragment>
  );
}

export default Profile;
