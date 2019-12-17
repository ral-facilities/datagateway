import axios from 'axios';
import * as log from 'loglevel';
import { DownloadCart, DownloadCartItem, Datafile } from 'datagateway-common';

// TODO: get URLs from settings or something...
const topcatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat';
const apiUrl = 'http://scigateway-preprod.esc.rl.ac.uk:5000';
const idsUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids';

export const fetchDownloadCartItems: () => Promise<DownloadCartItem[]> = () => {
  return axios
    .get<DownloadCart>(`${topcatUrl}/user/cart/LILS`, {
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

export const removeAllDownloadCartItems: () => Promise<void> = () => {
  return axios
    .delete(`${topcatUrl}/user/cart/LILS/cartItems`, {
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
  entityType: string
) => Promise<void> = (entityId: number, entityType: string) => {
  return axios
    .delete(`${topcatUrl}/user/cart/LILS/cartItems`, {
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

export const submitCart: (
  facilityName: string,
  transport: string,
  emailAddress: string,
  fileName: string
) => Promise<number> = (facilityName: string, transport: string, emailAddress:string, fileName: string) => {
  // Construct the form parameters.
  const params = new URLSearchParams();
  // TODO: get session ID from somewhere else (extract from JWT)
  params.append('sessionId', window.localStorage.getItem('icat:token') || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  params.append('fileName', fileName);

  // TODO: zipType by default is 'ZIP', can be 'ZIP_AND_COMPRESS'.
  params.append('zipType', 'ZIP');
  
  return axios
    .post(`${topcatUrl}/user/cart/${facilityName}/submit`, params)
    .then(response => {
      log.debug(response);
      console.log(response);
      
      // Get the downloadId that was returned from the IDS server.
      const downloadId = response.data['downloadId'] as number;
      console.log(downloadId);

      return downloadId;
    })
    .catch(error => {
      log.error(error.message);
      return -1;
    })
}

export const downloadPreparedCart: (
  preparedId: number,
  fileName: string
) => void = (preparedId: number, fileName: string) => {

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
}


export const getSize: (
  entityId: number,
  entityType: string
) => Promise<number> = (entityId: number, entityType: string) => {
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
      .get<number>(`${topcatUrl}/user/getSize`, {
        params: {
          // TODO: get session ID from somewhere else (extract from JWT)
          sessionId: window.localStorage.getItem('icat:token'),
          facilityName: 'LILS',
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
  entityType: string
) => Promise<number> = (entityId: number, entityType: string) => {
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
  cartItems: DownloadCartItem[]
) => Promise<number> = (cartItems: DownloadCartItem[]) => {
  const getDatafileCountPromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getDatafileCountPromises.push(
      getDatafileCount(cartItem.entityId, cartItem.entityType)
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

export const getCartSize: (cartItems: DownloadCartItem[]) => Promise<number> = (
  cartItems: DownloadCartItem[]
) => {
  const getSizePromises: Promise<number>[] = [];
  cartItems.forEach(cartItem =>
    getSizePromises.push(getSize(cartItem.entityId, cartItem.entityType))
  );

  return Promise.all(getSizePromises).then(sizes =>
    sizes.reduce(
      (accumulator, nextSize) =>
        nextSize > -1 ? accumulator + nextSize : accumulator,
      0
    )
  );
};
