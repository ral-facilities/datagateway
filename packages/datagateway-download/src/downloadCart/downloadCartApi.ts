import axios from 'axios';
import * as log from 'loglevel';
import {
  DownloadCart,
  SubmitCart,
  DownloadCartItem,
  Datafile,
  Download,
} from 'datagateway-common';
import React from 'react';
import { DownloadSettingsContext, DownloadSettings } from '../ConfigProvider';

// TODO: get URLs from settings or something...
// const downloadApiUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat';
// const apiUrl = 'http://scigateway-preprod.esc.rl.ac.uk:5000';
// const idsUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids';

export const fetchDownloadCartItems: (
  facilityName: string,
  downloadApiUrl: string
) => Promise<DownloadCartItem[]> = (
  facilityName: string,
  downloadApiUrl: string
) => {
  return axios
    .get<DownloadCart>(`${downloadApiUrl}/user/cart/${facilityName}`, {
      params: {
        // TODO: get session ID from somewhere else (extract from JWT)
        sessionId: window.localStorage.getItem('icat:token'),
      },
    })
    .then(response => {
      return response.data.cartItems;
    })
    .catch(error => {
      log.error(error.message);
      return [];
    });
};

export const removeAllDownloadCartItems: (
  facilityName: string,
  downloadApiUrl: string
) => Promise<void> = (facilityName: string, downloadApiUrl: string) => {
  return axios
    .delete(`${downloadApiUrl}/user/cart/${facilityName}/cartItems`, {
      params: {
        // TODO: get session ID from somewhere else (extract from JWT)
        sessionId: window.localStorage.getItem('icat:token'),
        items: '*',
      },
    })
    .then(() => {})
    .catch(error => {
      log.error(error.message);
    });
};

export const removeDownloadCartItem: (
  entityId: number,
  entityType: string,
  facilityName: string,
  downloadApiUrl: string
) => Promise<void> = (
  entityId: number,
  entityType: string,
  facilityName: string,
  downloadApiUrl: string
) => {
  return axios
    .delete(`${downloadApiUrl}/user/cart/${facilityName}/cartItems`, {
      params: {
        // TODO: get session ID from somewhere else (extract from JWT)
        sessionId: window.localStorage.getItem('icat:token'),
        items: `${entityType} ${entityId}`,
      },
    })
    .then(() => {})
    .catch(error => {
      log.error(error.message);
    });
};

export const getIsTwoLevel: (idsUrl: string) => Promise<boolean> = (
  idsUrl: string
) => {
  return axios
    .get<boolean>(`${idsUrl}/isTwoLevel`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      log.error(error.message);
      return false;
    });
};

export const submitCart: (
  facilityName: string,
  transport: string,
  emailAddress: string,
  fileName: string,
  downloadApiUrl: string
) => Promise<number> = (
  facilityName: string,
  transport: string,
  emailAddress: string,
  fileName: string,
  downloadApiUrl: string
) => {
  const params = new URLSearchParams();

  // TODO: get session ID from somewhere else (extract from JWT)
  // Construct the form parameters.
  params.append('sessionId', window.localStorage.getItem('icat:token') || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  params.append('fileName', fileName);

  // NOTE: zipType by default is 'ZIP', it can be 'ZIP_AND_COMPRESS'.
  params.append('zipType', 'ZIP');

  return axios
    .post<SubmitCart>(
      `${downloadApiUrl}/user/cart/${facilityName}/submit`,
      params
    )
    .then(response => {
      log.debug(response);

      // Get the downloadId that was returned from the IDS server.
      const downloadId = response.data['downloadId'];
      return downloadId;
    })
    .catch(error => {
      log.error(error.message);
      return -1;
    });
};

export const getDownload: (
  facilityName: string,
  downloadId: number,
  downloadApiUrl: string
) => Promise<Download | null> = (
  facilityName: string,
  downloadId: number,
  downloadApiUrl: string
) => {
  return axios
    .get<Download[]>(`${downloadApiUrl}/user/downloads`, {
      params: {
        // TODO: get session ID from somewhere else (extract from JWT)
        sessionId: window.localStorage.getItem('icat:token'),
        facilityName: facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then(response => {
      const download = response.data[0];
      return download;
    })
    .catch(error => {
      log.error(error.message);
      return null;
    });
};

export const downloadPreparedCart: (
  preparedId: string,
  fileName: string,
  idsUrl: string
) => void = (preparedId: string, fileName: string, idsUrl: string) => {
  // We need to set the preparedId and outname query parameters
  // for the IDS download.
  const params = {
    sessionId: window.localStorage.getItem('icat:token'),
    preparedId: preparedId,
    outname: fileName,
  };

  // Create our IDS link from the query parameters.
  const link = document.createElement('a');
  link.href = `${idsUrl}/getData?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  // We trigger an immediate download which will begin in a new tab.
  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const getSize: (
  entityId: number,
  entityType: string,
  facilityName: string,
  apiUrl: string,
  downloadApiUrl: string
) => Promise<number> = (
  entityId: number,
  entityType: string,
  facilityName: string,
  apiUrl: string,
  downloadApiUrl: string
) => {
  if (entityType === 'datafile') {
    return axios
      .get<Datafile>(`${apiUrl}/datafiles/${entityId}`, {
        headers: {
          // TODO: get session ID from somewhere else (extract from JWT)
          Authorization: `Bearer ${window.localStorage.getItem('icat:token')}`,
        },
      })
      .then(response => {
        const size = response.data['FILESIZE'] as number;
        return size;
      })
      .catch(error => {
        log.error(error.message);
        return -1;
      });
  } else {
    return axios
      .get<number>(`${downloadApiUrl}/user/getSize`, {
        params: {
          // TODO: get session ID from somewhere else (extract from JWT)
          sessionId: window.localStorage.getItem('icat:token'),
          // facilityName: 'LILS',
          facilityName: facilityName,
          entityType: entityType,
          entityId: entityId,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        log.error(error.message);
        return -1;
      });
  }
};

export const getDatafileCount: (
  entityId: number,
  entityType: string,
  apiUrl: string
) => Promise<number> = (
  entityId: number,
  entityType: string,
  apiUrl: string
) => {
  if (entityType === 'datafile') {
    return Promise.resolve(1);
  } else if (entityType === 'dataset') {
    return axios
      .get<number>(`${apiUrl}/datafiles/count`, {
        params: {
          where: {
            DATASET_ID: {
              eq: entityId,
            },
          },
        },
        headers: {
          // TODO: get session ID from somewhere else (extract from JWT)
          Authorization: `Bearer ${window.localStorage.getItem('icat:token')}`,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        log.error(error.message);
        return -1;
      });
  } else {
    return axios
      .get<number>(`${apiUrl}/datafiles/count`, {
        params: {
          include: '"DATASET"',
          where: {
            'DATASET.INVESTIGATION_ID': {
              eq: entityId,
            },
          },
        },
        headers: {
          // TODO: get session ID from somewhere else (extract from JWT)
          Authorization: `Bearer ${window.localStorage.getItem('icat:token')}`,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        log.error(error.message);
        return -1;
      });
  }
};

export const getCartDatafileCount: (
  cartItems: DownloadCartItem[],
  apiUrl: string
) => Promise<number> = (cartItems: DownloadCartItem[], apiUrl: string) => {
  const getDatafileCountPromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getDatafileCountPromises.push(
      getDatafileCount(cartItem.entityId, cartItem.entityType, apiUrl)
    )
  );

  return Promise.all(getDatafileCountPromises).then(counts =>
    counts.reduce(
      (accumulator, nextCount) =>
        nextCount > -1 ? accumulator + nextCount : accumulator,
      0
    )
  );
};

export const getCartSize: (
  cartItems: DownloadCartItem[],
  facilityName: string,
  apiUrl: string,
  downloadApiUrl: string
) => Promise<number> = (
  cartItems: DownloadCartItem[],
  facilityName: string,
  apiUrl: string,
  downloadApiUrl: string
) => {
  const getSizePromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getSizePromises.push(
      getSize(
        cartItem.entityId,
        cartItem.entityType,
        facilityName,
        apiUrl,
        downloadApiUrl
      )
    )
  );

  return Promise.all(getSizePromises).then(sizes =>
    sizes.reduce(
      (accumulator, nextSize) =>
        nextSize > -1 ? accumulator + nextSize : accumulator,
      0
    )
  );
};
