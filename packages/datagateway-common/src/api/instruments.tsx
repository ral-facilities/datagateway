import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import {
  AdditionalFilters,
  FiltersType,
  Instrument,
  SortType,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
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
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'instrument',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
      additionalFilters,
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchInstruments(apiUrl, { sort, filters }, additionalFilters, {
        startIndex,
        stopIndex,
      });
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const useInstrumentsInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'instrument',
      { sort: JSON.stringify(sort), filters },
      additionalFilters,
      apiUrl,
    ], // need to stringify sort as property order is important!
    queryFn: (params) =>
      fetchInstruments(
        apiUrl,
        { sort, filters },
        additionalFilters,
        params.pageParam
      ),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => ({
      startIndex: lastPageParam.stopIndex + 1,
      stopIndex: lastPageParam.stopIndex + INFINITE_SCROLL_BATCH_SIZE,
    }),
    initialPageParam: { startIndex: 0, stopIndex: 49 },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
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

export const useInstrumentCount = () => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['count', 'instrument', { filters }, apiUrl] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[2];
      return fetchInstrumentCount(apiUrl, filters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
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

export const useInstrumentDetails = (instrumentId: number) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['instrumentDetails', instrumentId, apiUrl] as const,
    queryFn: (params) => fetchInstrumentDetails(apiUrl, params.queryKey[1]),
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};
