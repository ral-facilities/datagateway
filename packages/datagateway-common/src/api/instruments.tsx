import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { FiltersType, Instrument, SortType } from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from 'react-query';

const fetchInstruments = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  offsetParams?: IndexRange
): Promise<Instrument[]> => {
  const params = getApiParams(sortAndFilters);

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  return axios
    .get(`${apiUrl}/instruments`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useInstrumentsPaginated = (): UseQueryResult<
  Instrument[],
  AxiosError
> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    Instrument[],
    AxiosError,
    Instrument[],
    [
      string,
      {
        sort: SortType;
        filters: FiltersType;
        page: number;
        results: number | null;
      }
    ]
  >(
    ['instrument', { sort, filters, page: page || 1, results: results || 10 }],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * (results ?? 10);
      const stopIndex = startIndex + (results ?? 10) - 1;
      return fetchInstruments(
        apiUrl,
        { sort, filters },
        {
          startIndex,
          stopIndex,
        }
      );
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const useInstrumentsInfinite = (): UseInfiniteQueryResult<
  Instrument[],
  AxiosError
> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    Instrument[],
    AxiosError,
    Instrument[],
    [string, { sort: SortType; filters: FiltersType }]
  >(
    ['investigation', { sort, filters }],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchInstruments(apiUrl, { sort, filters }, offsetParams);
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length >= 25) {
          return true;
        } else {
          return undefined;
        }
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const fetchInstrumentCount = (
  apiUrl: string,
  filters: FiltersType
): Promise<number> => {
  const params = getApiParams({ filters, sort: {} });
  params.delete('order');

  return axios
    .get(`${apiUrl}/instruments/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data);
};

export const useInstrumentCount = (): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, { filters: FiltersType }]
  >(
    ['count', 'instrument', { filters }],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchInstrumentCount(apiUrl, filters);
    },
    {
      placeholderData: 0,
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const fetchInstrumentDetails = (
  apiUrl: string,
  instrumentId: number
): Promise<Instrument> => {
  const params = new URLSearchParams();
  params.append('where', JSON.stringify({ id: { eq: instrumentId } }));
  params.append('include', JSON.stringify({ instrumentScientists: 'user' }));

  return axios
    .get(`${apiUrl}/instruments`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data[0]);
};

export const useInstrumentDetails = (
  instrumentId: number
): UseQueryResult<Instrument, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<Instrument, AxiosError, Instrument, [string, number]>(
    ['instrumentDetails', instrumentId],
    (params) => fetchInstrumentDetails(apiUrl, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};