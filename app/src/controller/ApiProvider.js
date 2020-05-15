/**
 * Logic for posting data to the backend api
 * @author mtownsend
 * @since April 2020
 * @flow
 */

const doPost = async (endpoint:string, data:any, auth?:string) => {
  const headers:{ [string]: string } = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (auth) {
    headers.Authorization = `Bearer ${auth}`
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

export const setFollowState = (auth:string, username:string, value:boolean) => 
  doPost(`user/${username}/follow`, { value }, auth);

export const setAttendingState = (auth:string, eventUid:string, value:boolean) =>
  doPost(`event/${eventUid}/join`, { value }, auth);
