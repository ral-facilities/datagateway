import axios from 'axios';
import type {
  Datafile,
  Dataset,
  DoiMetadata,
  DoiResponse,
  Download,
  DownloadCart,
  DownloadCartItem,
  Investigation,
  SubmitCart,
  User,
} from 'datagateway-common';
import { readSciGatewayToken } from 'datagateway-common';
import type { DownloadSettings } from './ConfigProvider';

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
    });
};

export const removeFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[],
  config: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
): Promise<DownloadCartItem[]> => {
  const { facilityName, downloadApiUrl } = config;

  return axios
    .delete<DownloadCart>(
      `${downloadApiUrl}/user/cart/${facilityName}/cartItems`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: `${entityType} ${entityIds.join(`, ${entityType} `)}`,
        },
      }
    )
    .then((response) => response.data.cartItems);
};

export const getIsTwoLevel: (settings: {
  idsUrl: string;
}) => Promise<boolean> = (settings: { idsUrl: string }) => {
  return axios
    .get<boolean>(`${settings.idsUrl}/isTwoLevel`)
    .then((response) => response.data);
};

export type SubmitCartZipType = 'ZIP' | 'ZIP_AND_COMPRESS';

export const submitCart: (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>,
  zipType?: SubmitCartZipType
) => Promise<number> = (
  transport,
  emailAddress,
  fileName,
  settings,
  zipType
) => {
  const params = new URLSearchParams();

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  params.append('fileName', fileName);

  // NOTE: zipType by default is 'ZIP', it can be 'ZIP_AND_COMPRESS'.
  params.append('zipType', zipType ? zipType : 'ZIP');

  return axios
    .post<SubmitCart>(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/submit`,
      params
    )
    .then((response) => {
      // Get the downloadId that was returned from the IDS server.
      return response.data['downloadId'];
    });
};

export const fetchDownloads: (
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>,
  queryOffset?: string
) => Promise<Download[]> = (settings, queryOffset) => {
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
    .then((response) => response.data);
};

export const fetchAdminDownloads: (
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>,
  queryOffset?: string
) => Promise<Download[]> = (settings, queryOffset) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/admin/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then((response) => response.data);
};

export const getDownload: (
  downloadId: number,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
) => Promise<Download> = (downloadId, settings) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then((response) => response.data[0]);
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
  // Create our IDS link from the query parameters.
  const link = document.createElement('a');
  link.href = getDataUrl(preparedId, fileName, settings.idsUrl);

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

/**
 * Describes the status of a download type.
 */
export interface DownloadTypeStatus {
  type: string;
  disabled: boolean;
  message: string;
}

export const getDownloadTypeStatus: (
  transportType: string,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
) => Promise<DownloadTypeStatus> = (transportType, settings) =>
  axios
    // the server doesn't put the transport type into the response object
    // it will be put in after the fact so that it is easier to work with
    .get<Omit<DownloadTypeStatus, 'type'>>(
      `${settings.downloadApiUrl}/user/downloadType/${transportType}/status`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
        },
      }
    )
    .then((response) => ({
      type: transportType,
      ...response.data,
    }));

export const downloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
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

  return axios.put(
    `${settings.downloadApiUrl}/user/download/${downloadId}/isDeleted`,
    params
  );
};

export const adminDownloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
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

  return axios.put(
    `${settings.downloadApiUrl}/admin/download/${downloadId}/isDeleted`,
    params
  );
};

export const adminDownloadStatus: (
  downloadId: number,
  status: string,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
) => Promise<void> = (
  downloadId: number,
  status: string,
  settings: Pick<DownloadSettings, 'facilityName' | 'downloadApiUrl'>
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', status);

  return axios.put(
    `${settings.downloadApiUrl}/admin/download/${downloadId}/status`,
    params
  );
};

export interface FileSizeAndCount {
  fileCount?: number;
  fileSize?: number;
}

export const getFileSizeAndCount: (
  entityId: number,
  entityType: 'investigation' | 'dataset' | 'datafile',
  settings: Pick<DownloadSettings, 'apiUrl'>
) => Promise<FileSizeAndCount> = (entityId, entityType, settings) => {
  return axios
    .get<Investigation | Dataset | Datafile>(
      `${settings.apiUrl}/${entityType}s/${entityId}`,
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      }
    )
    .then((response) => {
      return {
        fileCount:
          entityType === 'datafile'
            ? 1
            : (response.data as Dataset | Investigation).fileCount,
        fileSize: response.data.fileSize,
      };
    });
};

export const getDataUrl = (
  preparedId: string,
  fileName: string,
  idsUrl: string
): string => {
  // Construct a link to download the prepared cart.
  return `${idsUrl}/getData?sessionId=${
    readSciGatewayToken().sessionId
  }&preparedId=${preparedId}&outname=${fileName}`;
};

/**
 * Describes the progress of a download. Can be a percentage between 0-100
 * or a string describing the status of the download.
 */
export type DownloadProgress = number | string;

/**
 * Return a percentage of files that have been restored for the given prepared ID.
 * This will normally be an integer value between 0 and 100 but can also be a status value such as "UNKNOWN"
 */
export const getPercentageComplete = async ({
  preparedId,
  settings: { idsUrl },
}: {
  preparedId: string | undefined;
  settings: { idsUrl: string };
}): Promise<DownloadProgress> => {
  const { data } = await axios.get(`${idsUrl}/getPercentageComplete`, {
    params: { preparedId },
  });
  // try to parse the incoming data as a float
  const maybeNumber = parseFloat(data);
  // if data is not a number (NaN), it is a status value
  const isStatus = Number.isNaN(maybeNumber);
  return isStatus ? data : maybeNumber;
};

/**
 * Mint a DOI for a cart, returns a DataPublication ID & DOI
 */
export const mintCart = (
  cart: DownloadCartItem[],
  doiMetadata: DoiMetadata,
  settings: Pick<DownloadSettings, 'doiMinterUrl'>
): Promise<DoiResponse> => {
  const investigations: number[] = [];
  const datasets: number[] = [];
  const datafiles: number[] = [];
  cart.forEach((cartItem) => {
    if (cartItem.entityType === 'investigation')
      investigations.push(cartItem.entityId);
    if (cartItem.entityType === 'dataset') datasets.push(cartItem.entityId);
    if (cartItem.entityType === 'datafile') datafiles.push(cartItem.entityId);
  });
  return axios
    .post(
      `${settings.doiMinterUrl}/mint`,
      {
        metadata: {
          ...doiMetadata,
          resource_type: investigations.length === 0 ? 'Dataset' : 'Collection',
        },
        ...(investigations.length > 0
          ? { investigation_ids: investigations }
          : {}),
        ...(datasets.length > 0 ? { dataset_ids: datasets } : {}),
        ...(datafiles.length > 0 ? { datafile_ids: datafiles } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      }
    )
    .then((response) => response.data);
};

const fetchEntityUsers = (
  apiUrl: string,
  entityId: number,
  entityType: 'investigation' | 'dataset' | 'datafile'
): Promise<User[]> => {
  const params = new URLSearchParams();
  params.append('where', JSON.stringify({ id: { eq: entityId } }));

  if (entityType === 'investigation')
    params.append('include', JSON.stringify({ investigationUsers: 'user' }));
  if (entityType === 'dataset')
    params.append(
      'include',
      JSON.stringify({ investigation: { investigationUsers: 'user' } })
    );
  if (entityType === 'datafile')
    params.append(
      'include',
      JSON.stringify({
        dataset: { investigation: { investigationUsers: 'user' } },
      })
    );

  return axios
    .get(`${apiUrl}/${entityType}s`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      const entity = response.data[0];
      if (entityType === 'investigation') {
        return (entity as Investigation).investigationUsers?.map(
          (iUser) => iUser.user
        ) as User[];
      }
      if (entityType === 'dataset') {
        return (entity as Dataset).investigation?.investigationUsers?.map(
          (iUser) => iUser.user
        ) as User[];
      }
      if (entityType === 'datafile')
        return (
          entity as Datafile
        ).dataset?.investigation?.investigationUsers?.map(
          (iUser) => iUser.user
        ) as User[];
      return [];
    });
};

/**
 * Deduplicates items in an array
 * @param array Array to make unique
 * @param key Function to apply to an array item that returns a primitive that keys that item
 * @returns a deduplicated array
 */
function uniqBy<T>(array: T[], key: (item: T) => number | string): T[] {
  const seen: Record<number | string, boolean> = {};
  return array.filter(function (item) {
    const k = key(item);
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}

/**
 * Returns a list of users from ICAT which are InvestigationUsers for each item in the cart
 */
export const getCartUsers = async (
  cart: DownloadCartItem[],
  settings: Pick<DownloadSettings, 'apiUrl'>
): Promise<User[]> => {
  let users: User[] = [];
  for (const cartItem of cart) {
    const entityUsers = await fetchEntityUsers(
      settings.apiUrl,
      cartItem.entityId,
      cartItem.entityType
    );
    users = users.concat(entityUsers);
  }

  users = uniqBy(users, (item) => item.id);

  return users;
};
