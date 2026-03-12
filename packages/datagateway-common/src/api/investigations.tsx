import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getApiParams, parseSearchToQuery } from '.';
import type {
  AdditionalFilters,
  FiltersType,
  Investigation,
  SkipAndLimitType,
  SortType,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
import { useEntity } from './generic';
import { useRetryICATErrors } from './retryICATErrors';

export const fetchInvestigations = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  skipAndLimit?: SkipAndLimitType,
  ignoreIDSort?: boolean
): Promise<Investigation[]> => {
  const params = getApiParams(sortAndFilters, ignoreIDSort);

  if (skipAndLimit) {
    params.append('skip', JSON.stringify(skipAndLimit.skip));
    params.append('limit', JSON.stringify(skipAndLimit.limit));
  }

  additionalFilters?.forEach((filter) => {
    params.append(filter.filterType, filter.filterValue);
  });

  return axios
    .get(`${apiUrl}/investigations`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useInvestigationsPaginated = (
  additionalFilters?: AdditionalFilters,
  ignoreIDSort?: boolean,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'investigation',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
      additionalFilters,
      ignoreIDSort,
      apiUrl,
    ] as const,

    queryFn: (params) => {
      const { page, results } = params.queryKey[1];
      const skip = (page - 1) * results;
      const limit = results;
      return fetchInvestigations(
        apiUrl,
        { sort, filters },
        additionalFilters,
        {
          skip,
          limit,
        },
        ignoreIDSort
      );
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const useInvestigationsInfinite = (
  additionalFilters?: AdditionalFilters,
  ignoreIDSort?: boolean,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'investigation',
      { sort: JSON.stringify(sort), filters }, // need to stringify sort as property order is important!
      additionalFilters,
      ignoreIDSort,
      apiUrl,
    ],
    queryFn: (params) =>
      fetchInvestigations(
        apiUrl,
        { sort, filters },
        additionalFilters,
        params.pageParam,
        ignoreIDSort
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

export const fetchInvestigationCount = (
  apiUrl: string,
  filters: FiltersType,
  additionalFilters?: AdditionalFilters
): Promise<number> => {
  const params = getApiParams({ filters, sort: {} });
  params.delete('order');

  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  return axios
    .get(`${apiUrl}/investigations/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data);
};

export const useInvestigationCount = (
  additionalFilters?: AdditionalFilters
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const filters = parseSearchToQuery(location.search).filters;
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'count',
      'investigation',
      { filters },
      additionalFilters,
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[2];
      return fetchInvestigationCount(apiUrl, filters, additionalFilters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};

export const useInvestigationDetails = (
  investigationId: number
): UseQueryResult<Investigation, AxiosError> => {
  return useEntity('investigation', 'id', investigationId.toString(), {
    filterType: 'include',
    filterValue: JSON.stringify([
      { investigationUsers: 'user' },
      { samples: 'type' },
      { parameters: 'type' },
      'publications',
    ]),
  });
};

export const downloadInvestigation = (
  idsUrl: string,
  investigationId: number,
  investigationName: string
): void => {
  const params = {
    sessionId: readSciGatewayToken().sessionId,
    investigationIds: investigationId,
    compress: false,
    zip: true,
    outname: investigationName,
  };

  const link = document.createElement('a');
  link.href = `${idsUrl}/getData?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
