import axios from 'axios';
import * as log from 'loglevel';
import { Download } from 'datagateway-common';

// TODO: Need to be passed in from a configuration?
const topcatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat';
// const idsUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids';

export const fetchDownloads: (
  facilityName: string,
  queryOffset?: string
) => Promise<Download[]> = (facilityName: string, queryOffset?: string) => {
  return axios
    .get<Download[]>(`${topcatUrl}/user/downloads`, {
      params: {
        // TODO: get session ID from somewhere else (extract from JWT)
        sessionId: window.localStorage.getItem('icat:token'),
        facilityName: facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      log.error(error.message);
      return [];
    });
};

export const downloadDeleted: (
  facilityName: string,
  downloadId: number,
  deleted: boolean
) => Promise<void> = (
  facilityName: string,
  downloadId: number,
  deleted: boolean
) => {
  const params = new URLSearchParams();
  params.append('facilityName', facilityName);
  // TODO: get session ID from somewhere else (extract from JWT)
  params.append('sessionId', window.localStorage.getItem('icat:token') || '');
  params.append('value', JSON.stringify(deleted));

  return axios
    .put(`${topcatUrl}/user/download/${downloadId}/isDeleted`, params)
    .then(() => {})
    .catch(error => {
      log.error(error.message);
    });
};
