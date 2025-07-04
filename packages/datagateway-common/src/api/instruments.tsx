import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import {
  AdditionalFilters,
  FiltersType,
  Instrument,
  SortType,
} from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useRetryICATErrors } from './retryICATErrors';

const fetchInstruments = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
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

  additionalFilters?.forEach((filter) => {
    params.append(filter.filterType, filter.filterValue);
  });

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

export const useInstrumentsPaginated = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
): UseQueryResult<Instrument[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    Instrument[],
    AxiosError,
    Instrument[],
    [
      string,
      {
        sort: string;
        filters: FiltersType;
        page: number;
        results: number;
      }
    ]
  >(
    [
      'instrument',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
    ],
    (params) => {
      const { page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchInstruments(apiUrl, { sort, filters }, additionalFilters, {
        startIndex,
        stopIndex,
      });
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      enabled: isMounted ?? true,
    }
  );
};

export const useInstrumentsInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
): UseInfiniteQueryResult<Instrument[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery(
    ['instrument', { sort: JSON.stringify(sort), filters }], // need to stringify sort as property order is important!
    (params) => {
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchInstruments(
        apiUrl,
        { sort, filters },
        additionalFilters,
        offsetParams
      );
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      enabled: isMounted ?? true,
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
  const retryICATErrors = useRetryICATErrors();

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
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
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
  const retryICATErrors = useRetryICATErrors();

  return useQuery<Instrument, AxiosError, Instrument, [string, number]>(
    ['instrumentDetails', instrumentId],
    (params) => fetchInstrumentDetails(apiUrl, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};
