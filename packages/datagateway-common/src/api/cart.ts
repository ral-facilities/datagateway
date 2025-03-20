import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import {
  Download,
  DownloadCart,
  DownloadCartItem,
  DownloadTypeStatus,
  MicroFrontendId,
  SubmitCart,
} from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useQueryClient,
  useMutation,
  UseMutationResult,
  UseQueryOptions,
  useQueries,
  UseMutationOptions,
} from 'react-query';
import { useRetryICATErrors } from './retryICATErrors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '../state/actions/actions.types';

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
    'cart',
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
        queryClient.setQueryData('cart', data);
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
        queryClient.setQueryData('cart', data);
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

export const getDownloadTypeStatus: (
  transportType: string,
  facilityName: string,
  downloadApiUrl: string
) => Promise<DownloadTypeStatus> = (
  transportType,
  facilityName,
  downloadApiUrl
) =>
  axios
    // the server doesn't put the transport type into the response object
    // it will be put in after the fact so that it is easier to work with
    .get<Omit<DownloadTypeStatus, 'type'>>(
      `${downloadApiUrl}/user/downloadType/${transportType}/status`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: facilityName,
        },
      }
    )
    .then((response) => ({
      type: transportType,
      ...response.data,
    }));

export const useDownloadTypeStatuses = <TData = DownloadTypeStatus>({
  downloadTypes,
  facilityName,
  downloadApiUrl,
  ...queryOptions
}: {
  downloadTypes: string[];
  facilityName: string;
  downloadApiUrl: string;
} & UseQueryOptions<DownloadTypeStatus, AxiosError, TData>): UseQueryResult<
  TData,
  AxiosError
>[] => {
  // Load the download settings for use
  const [t] = useTranslation();

  const queryCount = downloadTypes.length;
  const loadedQueriesCount = React.useRef(0);
  const downloadTypesWithError = React.useRef<string[]>([]);

  function broadcastError(message: string): void {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message,
          },
        },
      })
    );
  }

  function handleQueryError(downloadType: string): void {
    downloadTypesWithError.current.push(downloadType);

    if (loadedQueriesCount.current === queryCount) {
      if (downloadTypesWithError.current.length === queryCount) {
        broadcastError(t('downloadConfirmDialog.access_methods_error'));
      } else {
        downloadTypesWithError.current.forEach((type) => {
          broadcastError(
            t('downloadConfirmDialog.access_method_error', {
              method: type.toUpperCase(),
            })
          );
        });
      }
    }
  }

  const queries = downloadTypes.map<
    UseQueryOptions<DownloadTypeStatus, AxiosError, TData>
  >((type) => ({
    queryKey: ['download-type-status', type],
    queryFn: () => getDownloadTypeStatus(type, facilityName, downloadApiUrl),
    onSettled: (_, error) => {
      loadedQueriesCount.current += 1;
      if (error) handleQueryError(type);
    },
    ...queryOptions,
    cacheTime: 0,
    staleTime: 0,
  }));

  // I have spent hours on this trying to make the type work,
  // but due to the limitation of TypeScript, it is basically impossible
  // for the type system to infer the return type of select properly.
  // https://github.com/TanStack/query/pull/2634#issuecomment-939537730
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return useQueries(queries);
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
      return response.data['downloadId'];
    });
};

/**
 * Defines the function that when called will roll back any optimistic changes
 * performed during a mutation.
 */
type RollbackFunction = () => void;

export interface SubmitCartParams {
  transport: string;
  emailAddress: string;
  fileName: string;
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

  return useMutation(
    ({ transport, emailAddress, fileName, zipType }) =>
      submitCart(
        transport,
        emailAddress,
        fileName,
        facilityName,
        downloadApiUrl,
        zipType
      ),
    {
      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },

      onSettled: () => {
        queryClient.invalidateQueries('cart');
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
  fileName: string,
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
  params.append('fileName', fileName);
  params.append('visitId', visitId);
  params.append('facilityName', facilityName);

  return axios
    .post<string[]>(`${downloadApiUrl}/user/queue/visit`, { params })
    .then((response) => {
      return response.data;
    });
};

interface QueueVisitParams
  extends Pick<SubmitCartParams, 'emailAddress' | 'transport' | 'fileName'> {
  visitId: string;
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
    ({ transport, emailAddress, fileName, visitId }) =>
      queueVisit(
        visitId,
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
