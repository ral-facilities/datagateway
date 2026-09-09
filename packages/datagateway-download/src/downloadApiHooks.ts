import {
  InfiniteData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  DOIMetadata,
  Download,
  DownloadCartItem,
  DownloadStatus,
  FiltersType,
  INFINITE_SCROLL_BATCH_SIZE,
  SortType,
  fetchDownloadCart,
  getDownload,
  handleDOIAPIError,
  handleICATError,
  useRetryICATErrors,
} from 'datagateway-common';
import pLimit from 'p-limit';
import React from 'react';
import { DownloadSettingsContext } from './ConfigProvider';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  deleteDraftDOI,
  downloadDeleted,
  fetchAdminDownloads,
  fetchDownloads,
  getCartUsers,
  getFileSizeAndCount,
  getIsTwoLevel,
  getPercentageComplete,
  mintDraftCart,
  publishDraftDOI,
  removeAllDownloadCartItems,
  removeFromCart,
} from './downloadApi';

/**
 * An enumeration of react query keys.
 */
export enum QueryKeys {
  /**
   * Key for querying a particular download.
   */
  DOWNLOAD = 'download',

  /**
   * Key for querying list of downloads.
   */
  DOWNLOADS = 'downloads',

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

export const useCart = () => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;
  const retryICATErrors = useRetryICATErrors();
  return useQuery({
    queryKey: [QueryKeys.CART, facilityName, downloadApiUrl],
    queryFn: () =>
      fetchDownloadCart({
        facilityName,
        downloadApiUrl,
      }),
    meta: { icatError: true },
    retry: retryICATErrors,
    staleTime: 0,
  });
};

export const useRemoveAllFromCart = () => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation({
    mutationFn: () =>
      removeAllDownloadCartItems({ facilityName, downloadApiUrl }),

    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.setQueriesData({ queryKey: [QueryKeys.CART] }, []);
    },

    retry: (failureCount: number, error: AxiosError) => {
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
  });
};

export const useRemoveEntityFromCart = () => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation({
    mutationFn: ({
      entityId,
      entityType,
    }: {
      entityId: number;
      entityType: 'investigation' | 'dataset' | 'datafile';
    }) =>
      removeFromCart(entityType, [entityId], {
        facilityName,
        downloadApiUrl,
      }),

    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueriesData({ queryKey: [QueryKeys.CART] }, data);
    },

    retry: (failureCount: number, error: AxiosError) => {
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
  });
};

export const useIsTwoLevel = () => {
  const settings = React.useContext(DownloadSettingsContext);
  const { idsUrl } = settings;
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['isTwoLevel', idsUrl],
    queryFn: () => getIsTwoLevel({ idsUrl }),
    meta: { icatError: true },
    retry: retryICATErrors,
    staleTime: Infinity,
  });
};

const fileSizeAndCountLimit = pLimit(20);

export const useFileSizesAndCounts = (data: DownloadCartItem[] | undefined) => {
  const settings = React.useContext(DownloadSettingsContext);
  const { apiUrl } = settings;
  const retryICATErrors = useRetryICATErrors();

  const queryConfigs = React.useMemo(() => {
    return data
      ? data.map((cartItem) => {
          const { entityId, entityType } = cartItem;
          return queryOptions({
            queryKey: ['fileSizeAndCount', entityId, apiUrl],
            queryFn: () =>
              fileSizeAndCountLimit(getFileSizeAndCount, entityId, entityType, {
                apiUrl,
              }),
            meta: { icatError: true },
            retry: retryICATErrors,
            staleTime: Infinity,
          });
        })
      : [];
  }, [data, retryICATErrors, apiUrl]);

  return useQueries({
    queries: queryConfigs,
  });
};

/**
 * A React hook that fetches all downloads created by the user.
 */
export const useDownloads = <TSelectData = Download[]>(
  selectFn?: (data: Download[]) => TSelectData
) => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      QueryKeys.DOWNLOADS,
      downloadSettings.facilityName,
      downloadSettings.downloadApiUrl,
    ],
    queryFn: () =>
      fetchDownloads({
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    meta: { icatError: true },
    retry: retryICATErrors,
    select: selectFn,
  });
};

export interface UseDownloadDeletedParams {
  downloadId: number;
  deleted: boolean;
}

/**
 * A React query that provides a mutation for deleting a download item.
 */
export const useDownloadOrRestoreDownload = () => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: ({ downloadId, deleted }: UseDownloadDeletedParams) =>
      downloadDeleted(downloadId, deleted, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),

    onMutate: ({ downloadId, deleted }, context) => {
      const prevDownloads = context.client.getQueriesData({
        queryKey: QueryKeys.DOWNLOADS,
      });

      if (deleted) {
        context.client.setQueriesData<Download[]>(
          { queryKey: [QueryKeys.DOWNLOADS] },
          (oldDownloads) =>
            oldDownloads &&
            oldDownloads.filter((download) => download.id !== downloadId)
        );
      }

      return { prevDownloads };
    },

    onSuccess: async (
      _data,
      { downloadId, deleted },
      _onMutateResult,
      context
    ) => {
      if (!deleted) {
        // download is restored (un-deleted), fetch the download info
        const restoredDownload = await getDownload(
          downloadId,
          downloadSettings.facilityName,
          downloadSettings.downloadApiUrl
        );

        if (restoredDownload) {
          context.client.setQueriesData<Download[]>(
            { queryKey: [QueryKeys.DOWNLOADS] },
            (downloads) => downloads && [...downloads, restoredDownload]
          );
        }
      }
    },

    onError: (error: AxiosError, _, onMutateResult, context) => {
      handleICATError(error);
      if (onMutateResult)
        context.client.setQueriesData(
          { queryKey: [QueryKeys.DOWNLOADS] },
          onMutateResult.prevDownloads
        );
    },

    retry: (failureCount, error) => {
      // if we get 431 we know this is an intermittent error so retry
      return error.response?.status === 431 && failureCount < 3;
    },
  });
};

const buildQueryOffset = (
  filters: FiltersType,
  sort: SortType,
  facilityName: string
) => {
  let queryOffset = `WHERE download.facilityName = '${facilityName}'`;
  for (const [column, filter] of Object.entries(filters)) {
    if (typeof filter === 'object') {
      if (!Array.isArray(filter)) {
        if ('startDate' in filter || 'endDate' in filter) {
          const startDate = filter.startDate
            ? `${filter.startDate}`
            : '0001-01-01 00:00:00';
          const endDate = filter.endDate
            ? `${filter.endDate}`
            : '9999-12-31 23:59:00';

          queryOffset += ` AND download.${column} BETWEEN {ts '${startDate}'} AND {ts '${endDate}'}`;
        }

        if ('type' in filter && filter.type) {
          // As UPPER is used need to pass text filters in upper case to avoid case sensitivity
          // also need to escape single quotes
          const filterValue =
            typeof filter.value === 'string'
              ? filter.type !== 'exact'
                ? (filter.value as string).toUpperCase().replaceAll("'", "''")
                : filter.value.replaceAll("'", "''")
              : filter.value;

          // use switch statement to ensure TS can detect we cover all cases
          switch (filter.type) {
            case 'include':
              queryOffset += ` AND UPPER(download.${column}) LIKE CONCAT('%', '${filterValue}', '%')`;
              break;
            case 'exclude':
              queryOffset += ` AND UPPER(download.${column}) NOT LIKE CONCAT('%', '${filterValue}', '%')`;
              break;
            case 'exact':
              queryOffset += ` AND download.${column} = '${filterValue}'`;
              break;
            default: {
              const exhaustiveCheck: never = filter.type;
              throw new Error(`Unhandled text filter type: ${exhaustiveCheck}`);
            }
          }
        }
      }
    }
  }

  queryOffset += ' ORDER BY';
  for (const [column, order] of Object.entries(sort)) {
    queryOffset += ` download.${column} ${order},`;
  }
  queryOffset += ' download.id ASC';

  return queryOffset;
};

/**
 * A React hook for querying admin downloads. Supports infinite scrolling.
 *
 * @param initialQueryOffset The initial query offset for the list of downloads.
 */
export const useAdminDownloads = ({
  filters,
  sort,
}: {
  filters: FiltersType;
  sort: SortType;
}) => {
  // Load the download settings for use
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useInfiniteQuery({
    queryKey: [
      QueryKeys.ADMIN_DOWNLOADS,
      filters,
      sort,
      downloadSettings.facilityName,
      downloadSettings.downloadApiUrl,
    ],
    queryFn: ({ pageParam }) =>
      fetchAdminDownloads(
        {
          facilityName: downloadSettings.facilityName,
          downloadApiUrl: downloadSettings.downloadApiUrl,
        },
        `${buildQueryOffset(filters, sort, downloadSettings.facilityName)} LIMIT ${pageParam.skip}, ${
          pageParam.limit
        }`
      ),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => ({
      skip: lastPageParam.skip + lastPageParam.limit,
      limit: INFINITE_SCROLL_BATCH_SIZE,
    }),
    initialPageParam: { skip: 0, limit: 50 },
    meta: { icatError: true },
  });
};

export interface AdminDownloadDeletedParams {
  downloadId: number;
  deleted: boolean;
}

/**
 * A React hook that provides a mutation function for deleting/restoring admin downloads.
 */
export const useAdminDownloadDeleted = () => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: ({ downloadId, deleted }: AdminDownloadDeletedParams) =>
      adminDownloadDeleted(downloadId, deleted, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),

    onSuccess: async (_, { downloadId }, _onMutateResult, context) => {
      const downloads = await fetchAdminDownloads(
        {
          facilityName: downloadSettings.facilityName,
          downloadApiUrl: downloadSettings.downloadApiUrl,
        },
        `WHERE download.id = ${downloadId}`
      );
      if (downloads.length > 0) {
        const updatedDownload = downloads[0];
        context.client.setQueriesData<InfiniteData<Download[]>>(
          { queryKey: [QueryKeys.ADMIN_DOWNLOADS], type: 'active' },
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

    onError: (error: AxiosError) => {
      handleICATError(error);
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: [QueryKeys.ADMIN_DOWNLOADS],
        type: 'active',
      });
    },
  });
};

/**
 * Parameters for {@link useAdminUpdateDownloadStatus} mutation.
 */
export interface AdminUpdateDownloadStatusParams {
  downloadId: number;
  status: DownloadStatus;
}

export const useAdminUpdateDownloadStatus = () => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: ({ downloadId, status }: AdminUpdateDownloadStatusParams) =>
      adminDownloadStatus(downloadId, status, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),

    onMutate: ({ downloadId, status }, context) => {
      const prevDownloads = context.client.getQueriesData<
        InfiniteData<Download[]>
      >({
        queryKey: [QueryKeys.ADMIN_DOWNLOADS],
        type: 'active',
      });

      context.client.setQueriesData<InfiniteData<Download[]>>(
        {
          queryKey: [QueryKeys.ADMIN_DOWNLOADS],
          type: 'active',
        },
        (oldData) =>
          oldData && {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((download) =>
                download.id === downloadId ? { ...download, status } : download
              )
            ),
          }
      );

      return { prevDownloads };
    },

    onError: (error: AxiosError, _, onMutateResult, context) => {
      handleICATError(error);
      if (onMutateResult) {
        onMutateResult.prevDownloads.forEach(([queryKey, prevDownload]) => {
          context.client.setQueryData<InfiniteData<Download[]>>(
            queryKey,
            prevDownload
          );
        });
      }
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: [QueryKeys.ADMIN_DOWNLOADS],
        type: 'active',
      });
    },
  });
};

/**
 * Queries the progress of a {@link Download}.
 * @param download The {@link Download} that this query should query the restore progress of.
 * @param idsUrl The idsUrl to query.
 * @param enabled Whether to disable the query.
 */
export const useDownloadPercentageComplete = ({
  download,
  idsUrl,
  enabled,
}: {
  download: Download;
  idsUrl: string;
  enabled?: boolean;
}) => {
  const preparedId = download.preparedId;

  return useQuery({
    queryKey: [QueryKeys.DOWNLOAD_PROGRESS, preparedId ?? '', idsUrl],
    // undefined preparedId is handled in downloadProgressIndicator & disables the query anyway
    queryFn: () =>
      getPercentageComplete({
        preparedId: preparedId,
        settings: { idsUrl },
      }),
    meta: { icatError: true, broadcastCondition: () => false },
    enabled,
  });
};

/**
 * Mints a draft of a cart
 * @param cart The {@link Cart} to mint
 * @param doiMetadata The required metadata for the DOI
 */
export const useMintDraftCart = () => {
  const settings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: ({
      cart,
      doiMetadata,
    }: {
      cart: DownloadCartItem[];
      doiMetadata: DOIMetadata;
    }) => {
      return mintDraftCart(cart, doiMetadata, settings);
    },
    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

/**
 * Publishes a draft data publication
 * @param dataPublicationId The {@link DataPublication} to publish
 */
export const usePublishDraft = () => {
  const settings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: (dataPublicationId: string) => {
      return publishDraftDOI(dataPublicationId, settings);
    },

    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

/**
 * Deletes a draft data publication
 * @param dataPublicationId The {@link DataPublication} to publish
 */
export const useDeleteDraft = () => {
  const settings = React.useContext(DownloadSettingsContext);

  return useMutation({
    mutationFn: (dataPublicationId: string) => {
      return deleteDraftDOI(dataPublicationId, settings);
    },

    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

/**
 * Gets the total list of users associated with each item in the cart
 * @param cart The {@link Cart} that we're getting the users for
 */
export const useCartUsers = (cart?: DownloadCartItem[]) => {
  const settings = React.useContext(DownloadSettingsContext);

  return useQuery({
    queryKey: ['cartUsers', cart, settings],
    queryFn: () => getCartUsers(cart ?? [], settings),
    meta: { icatError: true },
    staleTime: Infinity,
  });
};
