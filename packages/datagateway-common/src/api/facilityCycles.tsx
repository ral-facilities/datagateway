import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import { FacilityCycle, FiltersType, SortType } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
import { useRetryICATErrors } from './retryICATErrors';

const fetchFacilityCycles = (
  apiUrl: string,
  instrumentId: number,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  offsetParams?: IndexRange
): Promise<FacilityCycle[]> => {
  const params = getApiParams(sortAndFilters);

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  params.append(
    'where',
    JSON.stringify({
      'investigationFacilityCycles.investigation.investigationInstruments.instrument.id':
        {
          eq: instrumentId,
        },
    })
  );
  // Distinct is needed as otherwise it returns duplicate cycles for every cycle with a unique investigation with the matching instrument id
  params.append(
    'distinct',
    JSON.stringify(['id', 'name', 'startDate', 'endDate'])
  );

  return axios
    .get(`${apiUrl}/facilitycycles`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const fetchAllFacilityCycles = (
  apiUrl: string
): Promise<FacilityCycle[]> => {
  return axios
    .get(`${apiUrl}/facilitycycles`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useAllFacilityCycles = (enabled?: boolean) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['facilityCycle', apiUrl],
    queryFn: () => fetchAllFacilityCycles(apiUrl),
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled,
  });
};

export const useFacilityCyclesPaginated = (
  instrumentId: number,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'facilityCycle',
      instrumentId,
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },

      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { page, results } = params.queryKey[2];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchFacilityCycles(
        apiUrl,
        instrumentId,
        { sort, filters },
        {
          startIndex,
          stopIndex,
        }
      );
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const useFacilityCyclesInfinite = (
  instrumentId: number,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'facilityCycle',
      instrumentId,
      { sort: JSON.stringify(sort), filters },

      apiUrl,
    ],
    queryFn: (params) =>
      fetchFacilityCycles(
        apiUrl,
        instrumentId,
        { sort, filters },
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

const fetchFacilityCycleCount = (
  apiUrl: string,
  instrumentId: number,
  filters: FiltersType
): Promise<number> => {
  const params = getApiParams({ filters, sort: {} });
  params.delete('order');

  params.append(
    'where',
    JSON.stringify({
      'investigationFacilityCycles.investigation.investigationInstruments.instrument.id':
        {
          eq: instrumentId,
        },
    })
  );
  // Distinct is needed as otherwise it returns duplicate cycles for every cycle with a unique investigation with the matching instrument id
  params.append(
    'distinct',
    JSON.stringify(['id', 'name', 'startDate', 'endDate'])
  );

  return axios
    .get(`${apiUrl}/facilitycycles/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useFacilityCycleCount = (instrumentId: number) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'count',
      'facilityCycle',
      instrumentId,
      { filters },
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[3];
      return fetchFacilityCycleCount(apiUrl, instrumentId, filters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};
