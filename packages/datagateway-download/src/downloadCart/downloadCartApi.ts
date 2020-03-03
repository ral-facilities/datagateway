import axios from 'axios';
import * as log from 'loglevel';
import {
  DownloadCart,
  SubmitCart,
  DownloadCartItem,
  Datafile,
  Download,
  readSciGatewayToken,
  handleICATError,
} from 'datagateway-common';

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
        sessionId: readSciGatewayToken().sessionId,
      },
    })
    .then(response => {
      return response.data.cartItems;
    })
    .catch(error => {
      handleICATError(error);
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
        sessionId: readSciGatewayToken().sessionId,
        items: '*',
      },
    })
    .then(() => {})
    .catch(handleICATError);
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
        sessionId: readSciGatewayToken().sessionId,
        items: `${entityType} ${entityId}`,
      },
    })
    .then(() => {})
    .catch(handleICATError);
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
      handleICATError(error, false);
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

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
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
      handleICATError(error);
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
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then(response => {
      const download = response.data[0];
      return download;
    })
    .catch(error => {
      handleICATError(error);
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
    sessionId: readSciGatewayToken().sessionId,
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
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => {
  if (entityType === 'datafile') {
    return axios
      .get<Datafile>(`${settings.apiUrl}/datafiles/${entityId}`, {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        const size = response.data['FILESIZE'] as number;
        return size;
      })
      .catch(error => {
        handleICATError(error, false);
        return -1;
      });
  } else {
    return axios
      .get<number>(`${settings.downloadApiUrl}/user/getSize`, {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
          entityType: entityType,
          entityId: entityId,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        handleICATError(error, false);
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
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        handleICATError(error, false);
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
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        handleICATError(error, false);
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
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => Promise<number> = (
  cartItems: DownloadCartItem[],
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => {
  const getSizePromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getSizePromises.push(
      getSize(cartItem.entityId, cartItem.entityType, {
        facilityName: settings.facilityName,
        apiUrl: settings.apiUrl,
        downloadApiUrl: settings.downloadApiUrl,
      })
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
