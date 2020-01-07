import axios from 'axios';
import * as log from 'loglevel';
import { Download } from 'datagateway-common';

// TODO: Need to be passed in from a configuration?
const topcatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat';

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
                queryOffset: !queryOffset ? "where download.isDeleted = false" : queryOffset,
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
