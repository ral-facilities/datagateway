import { AdditionalFilters, FiltersType, SortType } from '../app.types';
import axios, { AxiosError } from 'axios';
import { Study } from '../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../parseTokens';
import handleICATError from '../handleICATError';
import {
  UseQueryResult,
  useQuery,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from 'react-query';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { getApiParams, parseSearchToQuery } from '.';
import { StateType } from '..';
import retryICATErrors from './retryICATErrors';

const fetchStudies = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange
): Promise<Study[]> => {
  const params = getApiParams(sortAndFilters);

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  return axios
    .get(`${apiUrl}/studies`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useStudiesPaginated = (
  additionalFilters?: AdditionalFilters
): UseQueryResult<Study[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    Study[],
    AxiosError,
    Study[],
    [
      string,
      {
        sort: SortType;
        filters: FiltersType;
        page: number;
        results: number;
      },
      AdditionalFilters?
    ]
  >(
    [
      'study',
      { sort, filters, page: page ?? 1, results: results ?? 10 },
      additionalFilters,
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchStudies(apiUrl, { sort, filters }, additionalFilters, {
        startIndex,
        stopIndex,
      });
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

export const useStudiesInfinite = (
  additionalFilters?: AdditionalFilters
): UseInfiniteQueryResult<Study[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    Study[],
    AxiosError,
    Study[],
    [string, { sort: SortType; filters: FiltersType }, AdditionalFilters?]
  >(
    ['study', { sort, filters }, additionalFilters],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchStudies(
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
    }
  );
};

export const useStudy = (
  studyId: number
): UseQueryResult<Study[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<Study[], AxiosError, Study[], [string, number]>(
    ['study', studyId],
    () => {
      return fetchStudies(apiUrl, { sort: {}, filters: {} }, [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { eq: studyId },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify([
            {
              studyInvestigations: {
                investigation: [
                  { investigationUsers: 'user' },
                  { investigationInstruments: 'instrument' },
                ],
              },
            },
          ]),
        },
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

const fetchStudyCount = (
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
    .get(`${apiUrl}/studies/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useStudyCount = (
  additionalFilters?: AdditionalFilters
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, { filters: FiltersType }, AdditionalFilters?]
  >(
    ['count', 'study', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchStudyCount(apiUrl, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};
