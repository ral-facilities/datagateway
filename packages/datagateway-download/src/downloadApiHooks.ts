import React from 'react';
import { AxiosError } from 'axios';
import type { Download, FormattedDownload } from 'datagateway-common';
import {
  DownloadCartItem,
  fetchDownloadCart,
  handleICATError,
  retryICATErrors,
} from 'datagateway-common';
import { DownloadSettingsContext } from './ConfigProvider';
import {
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import pLimit from 'p-limit';
import {
  downloadDeleted,
  fetchDownloads,
  getDatafileCount,
  getIsTwoLevel,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
} from './downloadApi';
import { useTranslation } from 'react-i18next';

/**
 * An enumeration of react query keys.
 */
export enum QueryKey {
  /**
   * Key for querying list of downloads.
   */
  DOWNLOADS = 'downloads',
}

export const useCart = (): UseQueryResult<DownloadCartItem[], AxiosError> => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;
  return useQuery(
    'cart',
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
      onSuccess: (data) => {
        queryClient.setQueryData('cart', []);
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
        queryClient.setQueryData('cart', data);
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

// TODO: refactor rest of dg-download to use react-query
// export const useSubmitCart = (): UseMutationResult<
//   number,
//   AxiosError,
//   {
//     transport: string;
//     emailAddress: string;
//     fileName: string;
//     zipType?: 'ZIP' | 'ZIP_AND_COMPRESS';
//   }
// > => {
//   const queryClient = useQueryClient();
//   const settings = React.useContext(DownloadSettingsContext);
//   const { facilityName, downloadApiUrl } = settings;

//   return useMutation(
//     ({ transport, emailAddress, fileName, zipType }) =>
//       submitCart(
//         transport,
//         emailAddress,
//         fileName,
//         {
//           facilityName,
//           downloadApiUrl,
//         },
//         zipType
//       ),
//     {
//       onSuccess: (data) => {
//         queryClient.setQueryData('cart', data);
//       },
//       onError: (error) => {
//         handleICATError(error);
//       },
//     }
//   );
// };

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

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  return queries;
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

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  return queries;
};

/**
 * A React hook that fetches all downloads created by the user.
 */
export const useDownloads = (): UseQueryResult<
  FormattedDownload[],
  AxiosError
> => {
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);
  const [t] = useTranslation();

  return useQuery(
    QueryKey.DOWNLOADS,
    () =>
      fetchDownloads({
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      select: (downloads: Download[]) =>
        downloads.map((download) => {
          const formattedIsDeleted = download.isDeleted ? 'Yes' : 'No';
          let formattedStatus = '';
          switch (download.status) {
            case 'COMPLETE':
              formattedStatus = t('downloadStatus.complete');
              break;
            case 'EXPIRED':
              formattedStatus = t('downloadStatus.expired');
              break;
            case 'PAUSED':
              formattedStatus = t('downloadStatus.paused');
              break;
            case 'PREPARING':
              formattedStatus = t('downloadStatus.preparing');
              break;
            case 'RESTORING':
              formattedStatus = t('downloadStatus.restoring');
              break;
          }
          return {
            ...download,
            status: formattedStatus,
            isDeleted: formattedIsDeleted,
          };
        }),
      onError: (error: AxiosError) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

/**
 * A React query that provides a mutation for deleting a download item.
 */
export const useDeleteDownload = (): UseMutationResult<
  void,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient();
  // Load the download settings for use.
  const downloadSettings = React.useContext(DownloadSettingsContext);

  return useMutation(
    (downloadId: number) =>
      downloadDeleted(downloadId, true, {
        facilityName: downloadSettings.facilityName,
        downloadApiUrl: downloadSettings.downloadApiUrl,
      }),
    {
      onSuccess: (_, downloadId: number) => {
        queryClient.setQueryData<FormattedDownload[] | undefined>(
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
      },
      onError: (error: AxiosError) => {
        handleICATError(error);
      },
      retry: (failureCount, error) => {
        // if we get 431 we know this is an intermittent error so retry
        return error.code === '431' && failureCount < 3;
      },
    }
  );
};
