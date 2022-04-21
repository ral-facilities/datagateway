import React from 'react';
import { AxiosError } from 'axios';
import {
  DownloadCartItem,
  handleICATError,
  fetchDownloadCart,
  removeFromCart,
} from 'datagateway-common';
import { DownloadSettingsContext } from './ConfigProvider';
import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
  UseQueryOptions,
  useQueries,
} from 'react-query';
import pLimit from 'p-limit';
import {
  removeAllDownloadCartItems,
  getSize,
  getDatafileCount,
  getIsTwoLevel,
} from './downloadApi';

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
