import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  AccessMethods,
  Download,
  DownloadCart,
  DownloadCartItem,
  SubmitCart,
} from '../app.types';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { useRetryICATErrors } from './retryICATErrors';

export const fetchDownloadCart = (config: {
  facilityName: string;
  downloadApiUrl: string;
}): Promise<DownloadCartItem[]> => {
  const { facilityName, downloadApiUrl } = config;

  return axios
    .get<DownloadCart>(`${downloadApiUrl}/user/cart/${facilityName}`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
      },
    })
    .then((response) => response.data.cartItems);
};

const addOrRemoveFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[],
  config: { facilityName: string; downloadApiUrl: string },
  remove?: boolean
): Promise<DownloadCartItem[]> => {
  const { facilityName, downloadApiUrl } = config;
  const params = new URLSearchParams();
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('items', `${entityType} ${entityIds.join(`, ${entityType} `)}`);
  if (typeof remove !== 'undefined') {
    params.append('remove', remove.toString());
  }

  return axios
    .post<DownloadCart>(
      `${downloadApiUrl}/user/cart/${facilityName}/cartItems`,
      params
    )
    .then((response) => response.data.cartItems);
};

export const useCart = (): UseQueryResult<DownloadCartItem[], AxiosError> => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );
  const retryICATErrors = useRetryICATErrors();
  return useQuery(
    ['cart'],
    () =>
      fetchDownloadCart({
        facilityName,
        downloadApiUrl,
      }),
    {
      enabled:
        document.getElementById('datagateway-dataview') !== null ||
        document.getElementById('datagateway-search') !== null,
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      staleTime: 0,
    }
  );
};

export const useAddToCart = (
  entityType: 'investigation' | 'dataset' | 'datafile'
): UseMutationResult<DownloadCartItem[], AxiosError, number[]> => {
  const queryClient = useQueryClient();
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  return useMutation(
    (entityIds: number[]) =>
      addOrRemoveFromCart(entityType, entityIds, {
        facilityName,
        downloadApiUrl,
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['cart'], data);
      },
      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        if (error.response?.status === 431 && failureCount < 3) {
          return true;
        } else {
          return false;
        }
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const useRemoveFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile'
): UseMutationResult<DownloadCartItem[], AxiosError, number[]> => {
  const queryClient = useQueryClient();
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  return useMutation(
    (entityIds: number[]) =>
      addOrRemoveFromCart(
        entityType,
        entityIds,
        {
          facilityName,
          downloadApiUrl,
        },
        true
      ),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['cart'], data);
      },
      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        if (error.response?.status === 431 && failureCount < 3) {
          return true;
        } else {
          return false;
        }
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const getDownloadTypes: (
  facilityName: string,
  downloadApiUrl: string
) => Promise<AccessMethods> = (facilityName, downloadApiUrl) =>
  axios
    .get<AccessMethods>(`${downloadApiUrl}/user/downloadType/status`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
      },
    })
    .then((response) =>
      Object.fromEntries(
        Object.entries(response.data).map(([id, accessMethod]) => [
          id,
          { ...accessMethod, idsUrl: accessMethod.idsUrl + '/ids' },
        ])
      )
    );

export const useDownloadTypes = (
  facilityName: string,
  downloadApiUrl: string
): UseQueryResult<AccessMethods, AxiosError> => {
  const retryICATErrors = useRetryICATErrors();

  return useQuery(
    ['downloadtypes'],
    () => getDownloadTypes(facilityName, downloadApiUrl),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

export type SubmitCartZipType = 'ZIP' | 'ZIP_AND_COMPRESS';

export const submitCart: (
  transport: string,
  emailAddress: string,
  fileName: string,
  facilityName: string,
  downloadApiUrl: string,
  zipType?: SubmitCartZipType
) => Promise<number> = (
  transport,
  emailAddress,
  fileName,
  facilityName,
  downloadApiUrl,
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
      `${downloadApiUrl}/user/cart/${facilityName}/submit`,
      params
    )
    .then((response) => {
      // Get the downloadId that was returned from the IDS server.
      const downloadId = response.data['downloadId'];
      if (downloadId) {
        return downloadId;
      } else {
        // fake axios error to ensure it gets handled by handleICATError correctly
        throw new axios.AxiosError(
          'No downloadId returned from submitCart request',
          '500',
          response.config,
          response.request,
          response
        );
      }
    });
};

export const getDefaultFileName = (
  defaultFileNameFormat: string,
  substitutions?: Record<string, string>
): string => {
  let defaultName = '';

  const formatArr = defaultFileNameFormat.split('_');
  const now = new Date(Date.now());

  formatArr.forEach((s) => {
    let formattedS = '';
    try {
      formattedS = format(now, s);
    } catch {
      formattedS = s;
    }

    defaultName =
      defaultName.length === 0 ? formattedS : `${defaultName}_${formattedS}`;
  });

  if (substitutions) {
    Object.entries(substitutions).forEach(([key, value]) => {
      defaultName = defaultName.replace(key, value);
    });
  }

  return defaultName;
};

/**
 * Defines the function that when called will roll back any optimistic changes
 * performed during a mutation.
 */
type RollbackFunction = () => void;

export interface SubmitCartParams {
  transport: string;
  emailAddress: string;
  fileName?: string;
  zipType?: SubmitCartZipType;
}

/**
 * A React hook for submitting a download cart.
 * Returns the download id for the submitted cart, which can then be used
 * to query more info.
 */
export const useSubmitCart = (
  facilityName: string,
  downloadApiUrl: string,
  options?: UseMutationOptions<
    number,
    AxiosError,
    SubmitCartParams,
    RollbackFunction
  >
): UseMutationResult<
  number,
  AxiosError,
  SubmitCartParams,
  RollbackFunction
> => {
  const queryClient = useQueryClient();
  const [t] = useTranslation();

  return useMutation(
    ({ transport, emailAddress, fileName: userFileName, zipType }) => {
      let fileName = userFileName;
      if (!fileName) {
        fileName = getDefaultFileName(
          t('downloadConfirmDialog.download_name_cart_default_format'),
          { facilityName }
        );
      }
      return submitCart(
        transport,
        emailAddress,
        fileName,
        facilityName,
        downloadApiUrl,
        zipType
      );
    },
    {
      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },

      onSettled: () => {
        queryClient.invalidateQueries(['cart']);
      },

      ...(options ?? {}),
    }
  );
};

export const getDownload: (
  downloadId: number,
  facilityName: string,
  downloadApiUrl: string
) => Promise<Download> = (downloadId, facilityName, downloadApiUrl) => {
  return axios
    .get<Download[]>(`${downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then((response) => response.data[0]);
};

export interface UseDownloadParams {
  id: number;
  facilityName: string;
  downloadApiUrl: string;
}

/**
 * A React hook that fetches a single download with the given id.
 * useQuery options can be passed in, which will override the default used.
 *
 * Example:
 * ```
 * useDownload({
 *   id: 123,
 *   select: (download) => format(download)
 * })
 * ```
 */
export const useDownload = ({
  id,
  facilityName,
  downloadApiUrl,
  ...queryOptions
}: UseDownloadParams &
  UseQueryOptions<
    Download,
    AxiosError,
    Download,
    ['download', number]
  >): UseQueryResult<Download, AxiosError> => {
  // Load the download settings for use.
  const retryICATErrors = useRetryICATErrors();

  return useQuery(
    ['download', id],
    () => getDownload(id, facilityName, downloadApiUrl),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      ...queryOptions,
    }
  );
};

export const fetchQueueAllowed = (config: {
  facilityName: string;
  downloadApiUrl: string;
}): Promise<boolean> => {
  const { facilityName, downloadApiUrl } = config;

  return axios
    .get<boolean>(`${downloadApiUrl}/user/queue/allowed`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName,
      },
    })
    .then((response) => response.data);
};

export const useQueueAllowed = (): UseQueryResult<boolean, AxiosError> => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );
  const retryICATErrors = useRetryICATErrors();
  return useQuery(
    ['isQueueAllowed', readSciGatewayToken().sessionId], // put session id in here to ensure we refresh if user logs out and logs in as new user
    () =>
      fetchQueueAllowed({
        facilityName,
        downloadApiUrl,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      staleTime: Infinity,
    }
  );
};

export const queueVisit: (
  visitId: string,
  transport: string,
  emailAddress: string,
  fileName: string | undefined,
  facilityName: string,
  downloadApiUrl: string
) => Promise<string[]> = (
  visitId,
  transport,
  emailAddress,
  fileName,
  facilityName,
  downloadApiUrl
) => {
  const params = new URLSearchParams();

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  if (fileName) params.append('fileName', fileName);
  params.append('visitId', visitId);
  params.append('facilityName', facilityName);

  return axios
    .post<string[]>(`${downloadApiUrl}/user/queue/visit`, params)
    .then((response) => {
      return response.data;
    });
};

export interface QueueVisitParams
  extends Pick<SubmitCartParams, 'emailAddress' | 'transport' | 'fileName'> {
  entityId: string;
}

/**
 * A React hook for submitting a visit to the queue.
 * Returns the list of download ids for the submitted visit,
 * which can then be used to query more info.
 */
export const useQueueVisit = (
  facilityName: string,
  downloadApiUrl: string,
  options?: UseMutationOptions<
    string[],
    AxiosError,
    QueueVisitParams,
    RollbackFunction
  >
): UseMutationResult<
  string[],
  AxiosError,
  QueueVisitParams,
  RollbackFunction
> => {
  return useMutation(
    ({ transport, emailAddress, fileName, entityId }) =>
      queueVisit(
        entityId,
        transport,
        emailAddress,
        fileName,
        facilityName,
        downloadApiUrl
      ),
    {
      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },
      ...(options ?? {}),
    }
  );
};

export const queueDataCollection: (
  dataCollectionId: string,
  transport: string,
  emailAddress: string,
  fileName: string | undefined,
  facilityName: string,
  downloadApiUrl: string
) => Promise<string[]> = (
  dataCollectionId,
  transport,
  emailAddress,
  fileName,
  facilityName,
  downloadApiUrl
) => {
  const params = new URLSearchParams();

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  if (fileName) params.append('fileName', fileName);
  params.append('dataCollectionId', dataCollectionId);
  params.append('facilityName', facilityName);

  return axios
    .post<string[]>(`${downloadApiUrl}/user/queue/dataCollection`, params)
    .then((response) => {
      return response.data;
    });
};

export interface QueueDataCollectionParams
  extends Pick<SubmitCartParams, 'emailAddress' | 'transport' | 'fileName'> {
  entityId: string;
}

/**
 * A React hook for submitting a data collection to the queue.
 * Returns the list of download ids for the submitted data collection,
 * which can then be used to query more info.
 */
export const useQueueDataCollection = (
  facilityName: string,
  downloadApiUrl: string,
  options?: UseMutationOptions<
    string[],
    AxiosError,
    QueueVisitParams,
    RollbackFunction
  >
): UseMutationResult<
  string[],
  AxiosError,
  QueueVisitParams,
  RollbackFunction
> => {
  return useMutation(
    ({ transport, emailAddress, fileName, entityId }) =>
      queueDataCollection(
        entityId,
        transport,
        emailAddress,
        fileName,
        facilityName,
        downloadApiUrl
      ),
    {
      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },
      ...(options ?? {}),
    }
  );
};
