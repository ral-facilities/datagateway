import { AxiosError } from 'axios';
import type { Download, DownloadStatus } from 'datagateway-common';
import {
  DownloadCartItem,
  fetchDownloadCart,
  handleICATError,
  MicroFrontendId,
  NotificationType,
  retryICATErrors,
} from 'datagateway-common';
import pLimit from 'p-limit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import { DownloadSettingsContext } from './ConfigProvider';
import type {
  DownloadProgress,
  DownloadTypeStatus,
  SubmitCartZipType,
} from './downloadApi';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  downloadDeleted,
  fetchAdminDownloads,
  fetchDownloads,
  getDatafileCount,
  getDownload,
  getDownloadTypeStatus,
  getIsTwoLevel,
  getPercentageComplete,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
  submitCart,
} from './downloadApi';

/**
 * An enumeration of react query keys.
 */
export enum QueryKey {
  /**
   * Key for querying a particular download.
   */
  DOWNLOAD = 'download',

  /**
   * Key for querying list of downloads.
   */
  DOWNLOADS = 'downloads',

  /**
   * Key for querying the status of a particular download type
   */
  DOWNLOAD_TYPE_STATUS = 'download-type-status',

  /**
   * Key for querying the progress of a download.
   */
  DOWNLOAD_PROGRESS = 'download-progress',

  /**
   * Key for querying list of admin downloads
   */
  ADMIN_DOWNLOADS = 'admin-downloads',

  /**
   * Key for querying the download cart.
   */
  CART = 'cart',
}

/**
 * Defines the function that when called will roll back any optimistic changes
 * performed during a mutation.
 */
type RollbackFunction = () => void;

export const useCart = (): UseQueryResult<DownloadCartItem[], AxiosError> => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;
  return useQuery(
    QueryKey.CART,
    () =>
      fetchDownloadCart({
        facilityName,
        downloadApiUrl,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      staleTime: 0,
    }
  );
};

export const useRemoveAllFromCart = (): UseMutationResult<
  void,
  AxiosError,
  void
> => {
  const queryClient = useQueryClient();
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    () => removeAllDownloadCartItems({ facilityName, downloadApiUrl }),
    {
      onSuccess: () => {
        queryClient.setQueryData(QueryKey.CART, []);
      },
      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        if (error.code === '431' && failureCount < 3) {
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

export const useRemoveEntityFromCart = (): UseMutationResult<
  DownloadCartItem[],
  AxiosError,
  { entityId: number; entityType: 'investigation' | 'dataset' | 'datafile' }
> => {
  const queryClient = useQueryClient();
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    ({ entityId, entityType }) =>
      removeFromCart(entityType, [entityId], {
        facilityName,
        downloadApiUrl,
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(QueryKey.CART, data);
      },
      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        if (error.code === '431' && failureCount < 3) {
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

export const useIsTwoLevel = (): UseQueryResult<boolean, AxiosError> => {
  const settings = React.useContext(DownloadSettingsContext);
  const { idsUrl } = settings;
  return useQuery('isTwoLevel', () => getIsTwoLevel({ idsUrl }), {
    onError: (error) => {
      handleICATError(error);
    },
    retry: retryICATErrors,
    staleTime: Infinity,
  });
};

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
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    ({ transport, emailAddress, fileName, zipType }) =>
      submitCart(
        transport,
        emailAddress,
        fileName,
        {
          facilityName,
          downloadApiUrl,
        },
        zipType
      ),
    {
      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },

      onSettled: () => {
        queryClient.invalidateQueries(QueryKey.CART);
      },

      ...(options ?? {}),
    }
  );
};

const sizesLimit = pLimit(20);

export const useSizes = (
  data: DownloadCartItem[] | undefined
): UseQueryResult<number, AxiosError>[] => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, apiUrl, downloadApiUrl } = settings;

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['size', number]
  >[] = React.useMemo(() => {
    return data
      ? data.map((cartItem) => {
          const { entityId, entityType } = cartItem;
          return {
            queryKey: ['size', entityId],
            queryFn: () =>
              sizesLimit(getSize, entityId, entityType, {
                facilityName,
                apiUrl,
                downloadApiUrl,
              }),
            onError: (error) => {
              handleICATError(error, false);
            },
            retry: retryICATErrors,
            staleTime: Infinity,
          };
        })
      : [];
  }, [data, facilityName, apiUrl, downloadApiUrl]);

  return useQueries(queryConfigs);
};

const datafileCountslimit = pLimit(20);

export const useDatafileCounts = (
  data: DownloadCartItem[] | undefined
): UseQueryResult<number, AxiosError>[] => {
  const settings = React.useContext(DownloadSettingsContext);
  const { apiUrl } = settings;

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['datafileCount', number]
  >[] = React.useMemo(() => {
    return data
      ? data.map((cartItem) => {
          const { entityId, entityType } = cartItem;
          return {
            queryKey: ['datafileCount', entityId],
            queryFn: () =>
              datafileCountslimit(getDatafileCount, entityId, entityType, {
                apiUrl,
              }),
            onError: (error) => {
              handleICATError(error, false);
            },
            retry: retryICATErrors,
            staleTime: Infinity,
            enabled: entityType !== 'datafile',
            initialData: entityType === 'datafile' ? 1 : undefined,
          };
        })
      : [];
  }, [data, apiUrl]);

  return useQueries(queryConfigs);
};

export interface UseDownloadParams {
  id: number;
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
export const useDownload = <T = Download>({
  id,
  ...queryOptions
}: UseDownloadParams &
  UseQueryOptions<
    Download,
    AxiosError,
    T,
    [QueryKey.DOWNLOAD, number]
  >): UseQueryResult<T, AxiosError> => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useQuery(
    [QueryKey.DOWNLOAD, id],
    () =>
      getDownload(id, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      ...queryOptions,
    }
  );
};

/**
 * A React hook that fetches all downloads created by the user.
 */
export const useDownloads = <TData = Download[]>(
  queryOptions?: UseQueryOptions<
    Download[],
    AxiosError,
    TData,
    QueryKey.DOWNLOADS
  >
): UseQueryResult<TData, AxiosError> => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useQuery(
    QueryKey.DOWNLOADS,
    () =>
      fetchDownloads({
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      ...queryOptions,
    }
  );
};

export interface UseDownloadDeletedParams {
  downloadId: number;
  deleted: boolean;
}

/**
 * A React query that provides a mutation for deleting a download item.
 */
export const useDownloadOrRestoreDownload = (): UseMutationResult<
  void,
  AxiosError,
  UseDownloadDeletedParams,
  RollbackFunction
> => {
  const queryClient = useQueryClient();
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation(
    ({ downloadId, deleted }) =>
      downloadDeleted(downloadId, deleted, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onMutate: ({ downloadId, deleted }) => {
        const prevDownloads = queryClient.getQueryData(QueryKey.DOWNLOADS);

        if (deleted) {
          queryClient.setQueryData<Download[] | undefined>(
            QueryKey.DOWNLOADS,
            // updater fn returns undefined if prev data is also undefined
            // note that it is not until v4 can the updater return undefined
            // in v4, when the updater returns undefined, react-query will bail out
            // and do nothing
            //
            // not sure how it works in v3, but returning an empty array feels wrong
            // here because of semantics -
            // undefined means the query is unavailable, but an empty array
            // indicates there's no download item.
            // hence FormattedDownload[] | undefined is passed to setQueryData
            // to allow undefined to be returned
            //
            // TODO: when migrating to react-query v4, the "| undefined" part is no longer needed and can be removed.
            //
            // related issue: https://github.com/TanStack/query/issues/506
            (oldDownloads) =>
              oldDownloads &&
              oldDownloads.filter((download) => download.id !== downloadId)
          );
        }

        return () =>
          queryClient.setQueryData(QueryKey.DOWNLOADS, prevDownloads);
      },

      onSuccess: async (_, { downloadId, deleted }) => {
        if (!deleted) {
          // download is restored (un-deleted), fetch the download info
          const restoredDownload = await getDownload(downloadId, {
            facilityName: downloadSettings.facilityName,
            downloadApiUrl: downloadSettings.downloadApiUrl,
          });

          if (restoredDownload) {
            queryClient.setQueryData<Download[] | undefined>(
              QueryKey.DOWNLOADS,
              (downloads) => downloads && [...downloads, restoredDownload]
            );
          }
        }
      },

      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },

      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        return error.code === '431' && failureCount < 3;
      },
    }
  );
};

export const useDownloadTypeStatuses = <TData = DownloadTypeStatus>({
  downloadTypes,
  ...queryOptions
}: {
  downloadTypes: string[];
} & UseQueryOptions<DownloadTypeStatus, AxiosError, TData>): UseQueryResult<
  TData,
  AxiosError
>[] => {
  // Load the download settings for use
  const downloadSettings = React.useContext(DownloadSettingsContext);
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
    queryKey: [QueryKey.DOWNLOAD_TYPE_STATUS, type],
    queryFn: () =>
      getDownloadTypeStatus(type, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    onSettled: (_, error) => {
      loadedQueriesCount.current += 1;
      if (error) handleQueryError(type);
    },
    ...queryOptions,
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

/**
 * A React hook for querying admin downloads. Supports infinite scrolling.
 *
 * @param initialQueryOffset The initial query offset for the list of downloads.
 */
export const useAdminDownloads = ({
  initialQueryOffset,
}: {
  initialQueryOffset: string;
}): UseInfiniteQueryResult<Download[], AxiosError> => {
  // Load the download settings for use
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useInfiniteQuery(
    QueryKey.ADMIN_DOWNLOADS,
    ({ pageParam = initialQueryOffset }) =>
      fetchAdminDownloads(
        {
          facilityName: downloadSettings.facilityName,
          downloadApiUrl: downloadSettings.downloadApiUrl,
        },
        pageParam
      ),
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export interface AdminDownloadDeletedParams {
  downloadId: number;
  deleted: boolean;
}

/**
 * A React hook that provides a mutation function for deleting/restoring admin downloads.
 */
export const useAdminDownloadDeleted = (): UseMutationResult<
  void,
  AxiosError,
  AdminDownloadDeletedParams,
  RollbackFunction
> => {
  const queryClient = useQueryClient();
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation(
    ({ downloadId, deleted }) =>
      adminDownloadDeleted(downloadId, deleted, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onSuccess: async (_, { downloadId }) => {
        const downloads = await fetchAdminDownloads(
          {
            facilityName: downloadSettings.facilityName,
            downloadApiUrl: downloadSettings.downloadApiUrl,
          },
          `WHERE download.id = ${downloadId}`
        );
        if (downloads.length > 0) {
          const updatedDownload = downloads[0];
          // updater fn returns undefined if prev data is also undefined
          // note that it is not until v4 can the updater return undefined
          // in v4, when the updater returns undefined, react-query will bail out
          // and do nothing
          //
          // not sure how it works in v3, but returning an empty array feels wrong
          // here because of semantics -
          // undefined means the query is unavailable, but an empty array
          // indicates there's no download item.
          // hence FormattedDownload[] | undefined is passed to setQueryData
          // to allow undefined to be returned
          //
          // TODO: when migrating to react-query v4, the "| undefined" part is no longer needed and can be removed.
          //
          // related issue: https://github.com/TanStack/query/issues/506
          queryClient.setQueryData<InfiniteData<Download[]> | undefined>(
            QueryKey.ADMIN_DOWNLOADS,
            (oldData) =>
              oldData && {
                ...oldData,
                pages: oldData.pages.map((page) =>
                  page.map((download) =>
                    download.id === updatedDownload.id
                      ? updatedDownload
                      : download
                  )
                ),
              }
          );
        }
      },

      onError: (error) => {
        handleICATError(error);
      },

      onSettled: () => {
        queryClient.invalidateQueries(QueryKey.ADMIN_DOWNLOADS);
      },
    }
  );
};

/**
 * Parameters for {@link useAdminUpdateDownloadStatus} mutation.
 */
export interface AdminUpdateDownloadStatusParams {
  downloadId: number;
  status: DownloadStatus;
}

export const useAdminUpdateDownloadStatus = (): UseMutationResult<
  void,
  AxiosError,
  AdminUpdateDownloadStatusParams,
  RollbackFunction
> => {
  const queryClient = useQueryClient();
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation(
    ({ downloadId, status }) =>
      adminDownloadStatus(downloadId, status, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onMutate: ({ downloadId, status }) => {
        const prevDownloads = queryClient.getQueryData(
          QueryKey.ADMIN_DOWNLOADS
        );

        // updater fn returns undefined if prev data is also undefined
        // note that it is not until v4 can the updater return undefined
        // in v4, when the updater returns undefined, react-query will bail out
        // and do nothing
        //
        // not sure how it works in v3, but returning an empty array feels wrong
        // here because of semantics -
        // undefined means the query is unavailable, but an empty array
        // indicates there's no download item.
        // hence FormattedDownload[] | undefined is passed to setQueryData
        // to allow undefined to be returned
        //
        // TODO: when migrating to react-query v4, the "| undefined" part is no longer needed and can be removed.
        //
        // related issue: https://github.com/TanStack/query/issues/506
        queryClient.setQueryData<InfiniteData<Download[]> | undefined>(
          QueryKey.ADMIN_DOWNLOADS,
          (oldData) =>
            oldData && {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((download) =>
                  download.id === downloadId
                    ? { ...download, status }
                    : download
                )
              ),
            }
        );

        return () =>
          queryClient.setQueryData(QueryKey.ADMIN_DOWNLOADS, prevDownloads);
      },

      onError: (error, _, rollback) => {
        handleICATError(error);
        if (rollback) rollback();
      },

      onSettled: () => {
        queryClient.invalidateQueries(QueryKey.ADMIN_DOWNLOADS);
      },
    }
  );
};

/**
 * Queries the progress of a {@link Download}.
 * @param prepareId The prepare ID of the {@link Download}.
 * @param queryOptions Optional `useQuery` option override.
 */
export const useDownloadPercentageComplete = <T = DownloadProgress>({
  preparedId,
  ...queryOptions
}: { preparedId: string } & UseQueryOptions<
  DownloadProgress,
  AxiosError,
  T,
  string[]
>): UseQueryResult<T, AxiosError> => {
  const { idsUrl } = React.useContext(DownloadSettingsContext);

  return useQuery(
    [QueryKey.DOWNLOAD_PROGRESS, preparedId],
    () =>
      getPercentageComplete({
        preparedId: preparedId,
        settings: { idsUrl },
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      ...queryOptions,
    }
  );
};
