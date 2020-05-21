import axios, { AxiosResponse } from 'axios';
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

export const fetchDownloadCartItems: (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => Promise<DownloadCartItem[]> = (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => {
  return axios
    .get<DownloadCart>(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
        },
      }
    )
    .then(response => {
      return response.data.cartItems;
    })
    .catch(error => {
      handleICATError(error);
      return [];
    });
};

export const removeAllDownloadCartItems: (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => Promise<void> = (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => {
  return axios
    .delete(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: '*',
        },
      }
    )
    .then(() => {
      // do nothing
    })
    .catch(handleICATError);
};

export const removeDownloadCartItem: (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  return axios
    .delete(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: `${entityType} ${entityId}`,
        },
      }
    )
    .then(() => {
      // do nothing
    })
    .catch(handleICATError);
};

export const getIsTwoLevel: (settings: {
  idsUrl: string;
}) => Promise<boolean> = (settings: { idsUrl: string }) => {
  return axios
    .get<boolean>(`${settings.idsUrl}/isTwoLevel`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      handleICATError(error, false);
      return false;
    });
};

export const submitCart: (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<number> = (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
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
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/submit`,
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

export const fetchDownloads: (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => Promise<Download[]> = (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      handleICATError(error);
      return [];
    });
};

export const getDownload: (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<Download | null> = (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
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
  settings: { idsUrl: string }
) => void = (
  preparedId: string,
  fileName: string,
  settings: { idsUrl: string }
) => {
  // We need to set the preparedId and outname query parameters
  // for the IDS download.
  const params = {
    sessionId: readSciGatewayToken().sessionId,
    preparedId: preparedId,
    outname: fileName,
  };

  // Create our IDS link from the query parameters.
  const link = document.createElement('a');
  link.href = `${settings.idsUrl}/getData?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  // We trigger an immediate download which will begin in a new tab.
  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);

  // Prevent the link from being clicked if this is an e2e test.
  if (!process.env.REACT_APP_E2E_TESTING) {
    link.click();
    link.remove();
  }
};

export const getDownloadTypeStatus: (
  transportType: string,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<{ disabled: boolean; message: string } | null> = (
  transportType: string,
  settings: { facilityName: string; downloadApiUrl: string }
) => {
  return axios
    .get(
      `${settings.downloadApiUrl}/user/downloadType/${transportType}/status`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
        },
      }
    )
    .then(
      (
        response: AxiosResponse<{
          disabled: boolean;
          message: string;
        }>
      ) => {
        return response.data;
      }
    )
    .catch(error => {
      if (error) handleICATError(error);
      return null;
    });
};

export const downloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', JSON.stringify(deleted));

  return axios
    .put(
      `${settings.downloadApiUrl}/user/download/${downloadId}/isDeleted`,
      params
    )
    .then(() => {
      // do nothing
    })
    .catch(error => {
      handleICATError(error);
    });
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
  settings: { apiUrl: string }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: { apiUrl: string }
) => {
  if (entityType === 'datafile') {
    return Promise.resolve(1);
  } else if (entityType === 'dataset') {
    return axios
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
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
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
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
  settings: { apiUrl: string }
) => Promise<number> = (
  cartItems: DownloadCartItem[],
  settings: { apiUrl: string }
) => {
  const getDatafileCountPromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getDatafileCountPromises.push(
      getDatafileCount(cartItem.entityId, cartItem.entityType, {
        apiUrl: settings.apiUrl,
      })
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
