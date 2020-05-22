/**
 * Service functions relating to ActivityPub
 * @author mtownsend
 * @since May 2020
 * @flow
 */

const DOMAIN = process.env.DOMAIN || '';

export const getUserId = (username:string) => `${DOMAIN}/user/${username}`;
export const getUsername = (userId:string) => userId.substring(userId.lastIndexOf('/') + 1);
export const getEventId = (eventUuid:string) => `${DOMAIN}/event/${eventUuid}`;
export const getEventUid = (eventId:string) => eventId.substring(eventId.lastIndexOf('/') + 1);
