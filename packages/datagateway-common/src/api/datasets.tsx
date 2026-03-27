import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getApiParams, parseSearchToQuery, useEntity } from '.';
import {
  AdditionalFilters,
  Dataset,
  FiltersType,
  SkipAndLimitType,
  SortType,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
import { useRetryICATErrors } from './retryICATErrors';

export const fetchDatasets = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  skipAndLimit?: SkipAndLimitType
): Promise<Dataset[]> => {
  const params = getApiParams(sortAndFilters);

  if (skipAndLimit) {
    params.append('skip', JSON.stringify(skipAndLimit.skip));
    params.append('limit', JSON.stringify(skipAndLimit.limit));
  }

  additionalFilters?.forEach((filter) => {
    params.append(filter.filterType, filter.filterValue);
  });

  return axios
    .get(`${apiUrl}/datasets`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useDatasetsPaginated = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'dataset',
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
      const skip = (page - 1) * results;
      const limit = results;
      return fetchDatasets(apiUrl, { sort, filters }, additionalFilters, {
        skip,
        limit,
      });
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const useDatasetsInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'dataset',
      { sort: JSON.stringify(sort), filters },
      additionalFilters,
      apiUrl,
    ], // need to stringify sort as property order is important!
    queryFn: (params) =>
      fetchDatasets(
        apiUrl,
        { sort, filters },
        additionalFilters,
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

export const fetchDatasetCountQuery = (
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
    .get(`${apiUrl}/datasets/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data);
};

export const useDatasetCount = (additionalFilters?: AdditionalFilters) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const filters = parseSearchToQuery(location.search).filters;
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'count',
      'dataset',
      { filters },
      additionalFilters,
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[2];
      return fetchDatasetCountQuery(apiUrl, filters, additionalFilters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};

export const useDatasetDetails = (
  datasetId: number
): UseQueryResult<Dataset, AxiosError> => {
  return useEntity('dataset', 'id', datasetId.toString(), {
    filterType: 'include',
    filterValue: JSON.stringify('type'),
  });
};

export const downloadDataset = (
  idsUrl: string,
  datasetId: number,
  datasetName: string
): void => {
  const params = {
    sessionId: readSciGatewayToken().sessionId,
    datasetIds: datasetId,
    compress: false,
    zip: true,
    outname: datasetName,
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
