import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { DownloadCart, DownloadCartItem } from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useQueryClient,
  useMutation,
  UseMutationResult,
} from 'react-query';

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

const addToCart = (
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

export const removeFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[],
  config: { facilityName: string; downloadApiUrl: string }
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

export const useCart = (): UseQueryResult<DownloadCartItem[], AxiosError> => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );
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
      addToCart(entityType, entityIds, {
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
      addToCart(
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
