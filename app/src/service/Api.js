/**
 * Logic for posting data to the backend api
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import { useInvalidate } from '../controller/ObjectProvider';
import { useAuth } from '../controller/AuthProvider';
import { delay } from '../util/util';
import { 
  getUserId,
  getEventId
} from '../service/ActivityPub';

export type ApiAction = {|
  endpoint: string,
  invalidate: Array<string>
|};

// TODO: Support following people from other servers
const FollowAction = (followUsername: string, currentUsername:string):ApiAction => ({
  endpoint: `user/${followUsername}/follow`,
  invalidate: [
    `${getUserId(currentUsername)}/following`,
    `${getUserId(followUsername)}/followers`,
    `${getUserId(currentUsername)}/outbox`
  ]
});

// TODO: Support attending events from other servers
const AttendAction = (eventUid:string, currentUsername:string):ApiAction => ({
  endpoint: `event/${eventUid}/join`,
  invalidate: [
    `${getUserId(currentUsername)}/attending`,
    `${getEventId(eventUid)}/attendees`,
    `${getUserId(currentUsername)}/outbox`
  ]
});

const doPost = async (endpoint:string, data:any, token?:?string) => {
  const headers:{ [string]: string } = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw `POST ${endpoint} failed: ${res.status} ${res.statusText}`;
  }
};

const useApiExec = () => {
  const invalidate = useInvalidate();
  const { token } = useAuth();

  return async (action:ApiAction, body:any) => {
    await doPost(action.endpoint, body, token);
    // Wait for stuff to complete on the backend
    // TODO: I'd love for this to not rely on magic numbers
    await delay(200);
    await Promise.all(action.invalidate.map(invalidate));
  };
};

export const useFollowToggle = (followUsername:string):(boolean => Promise<void>) => {
  const { username } = useAuth();
  if (!username) {
    return () => Promise.resolve();
  }
  const exec = useApiExec();
  const action = FollowAction(followUsername, username);
  return (value:boolean) => exec(action, { value });
};

export const useAttendingToggle = (eventUid:string):(boolean => Promise<void>) => {
  const { username } = useAuth();
  if (!username) {
    return () => Promise.resolve();
  }
  const exec = useApiExec();
  const action = AttendAction(eventUid, username);
  return (value:boolean) => exec(action, { value });
};
