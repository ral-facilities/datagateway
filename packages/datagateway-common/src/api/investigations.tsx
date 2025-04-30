import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import type {
  AdditionalFilters,
  FiltersType,
  Investigation,
  SortType,
} from '../app.types';
import { StateType } from '../state/app.types';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from 'react-query';
import { useRetryICATErrors } from './retryICATErrors';

export const fetchInvestigations = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange,
  ignoreIDSort?: boolean
): Promise<Investigation[]> => {
  const params = getApiParams(sortAndFilters, ignoreIDSort);

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

export const useInvestigation = (
  investigationId: number,
  additionalFilters?: AdditionalFilters
): UseQueryResult<Investigation[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    Investigation[],
    AxiosError,
    Investigation[],
    [string, number, AdditionalFilters?, boolean?]
  >(
    ['investigation', investigationId, additionalFilters],
    (_) => {
      return fetchInvestigations(apiUrl, { sort: {}, filters: {} }, [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { eq: investigationId },
          }),
        },
        ...(additionalFilters ?? []),
      ]);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

export const useInvestigationsPaginated = (
  additionalFilters?: AdditionalFilters,
  ignoreIDSort?: boolean,
  isMounted?: boolean
): UseQueryResult<Investigation[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    Investigation[],
    AxiosError,
    Investigation[],
    [
      string,
      {
        sort: string;
        filters: FiltersType;
        page: number;
        results: number;
      },
      AdditionalFilters?,
      boolean?
    ]
  >(
    [
      'investigation',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
      additionalFilters,
      ignoreIDSort,
    ],
    (params) => {
      const { page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchInvestigations(
        apiUrl,
        { sort, filters },
        additionalFilters,
        {
          startIndex,
          stopIndex,
        },
        ignoreIDSort
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

export const useInvestigationsInfinite = (
  additionalFilters?: AdditionalFilters,
  ignoreIDSort?: boolean,
  isMounted?: boolean
): UseInfiniteQueryResult<Investigation[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery(
    [
      'investigation',
      { sort: JSON.stringify(sort), filters }, // need to stringify sort as property order is important!
      additionalFilters,
      ignoreIDSort,
    ],
    (params) => {
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchInvestigations(
        apiUrl,
        { sort, filters },
        additionalFilters,
        offsetParams,
        ignoreIDSort
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
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const filters = parseSearchToQuery(location.search).filters;
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, { filters: FiltersType }, AdditionalFilters?]
  >(
    ['count', 'investigation', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchInvestigationCount(apiUrl, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

const fetchInvestigationDetails = (
  apiUrl: string,
  investigationId: number
): Promise<Investigation> => {
  const params = new URLSearchParams();
  params.append('where', JSON.stringify({ id: { eq: investigationId } }));
  params.append(
    'include',
    JSON.stringify([
      { investigationUsers: 'user' },
      { samples: 'type' },
      { parameters: 'type' },
      'publications',
    ])
  );

  return axios
    .get(`${apiUrl}/investigations`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data[0]);
};

export const useInvestigationDetails = (
  investigationId: number
): UseQueryResult<Investigation, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<Investigation, AxiosError, Investigation, [string, number]>(
    ['investigationDetails', investigationId],
    (params) => fetchInvestigationDetails(apiUrl, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
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
