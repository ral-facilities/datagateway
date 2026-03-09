import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getApiParams, parseSearchToQuery } from '.';
import {
  FacilityCycle,
  FiltersType,
  SkipAndLimitType,
  SortType,
} from '../app.types';
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
  skipAndLimit?: SkipAndLimitType
): Promise<FacilityCycle[]> => {
  const params = getApiParams(sortAndFilters);

  if (skipAndLimit) {
    params.append('skip', JSON.stringify(skipAndLimit.skip));
    params.append('limit', JSON.stringify(skipAndLimit.limit));
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
      const skip = (page - 1) * results;
      const limit = results;
      return fetchFacilityCycles(
        apiUrl,
        instrumentId,
        { sort, filters },
        {
          skip,
          limit,
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
      skip: lastPageParam.skip + lastPageParam.limit,
      limit: INFINITE_SCROLL_BATCH_SIZE,
    }),
    initialPageParam: { skip: 0, limit: 50 },
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
