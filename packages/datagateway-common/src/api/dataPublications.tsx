import { AdditionalFilters, FiltersType, SortType } from '../app.types';
import axios, { AxiosError } from 'axios';
import { DataPublication } from '../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../parseTokens';
import handleICATError from '../handleICATError';
import {
  UseQueryResult,
  useQuery,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  UseQueryOptions,
} from 'react-query';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getApiParams, parseSearchToQuery } from '.';
import { StateType } from '..';
import retryICATErrors from './retryICATErrors';

const fetchDataPublications = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange
): Promise<DataPublication[]> => {
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
    .get(`${apiUrl}/datapublications`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useDataPublicationsPaginated = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
): UseQueryResult<DataPublication[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    DataPublication[],
    AxiosError,
    DataPublication[],
    [
      string,
      {
        sort: string;
        filters: FiltersType;
        page: number;
        results: number;
      },
      AdditionalFilters?
    ]
  >(
    [
      'dataPublication',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
      additionalFilters,
    ],
    (params) => {
      const { page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchDataPublications(
        apiUrl,
        { sort, filters },
        additionalFilters,
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
      retry: retryICATErrors,
      enabled: isMounted ?? true,
    }
  );
};

export const useDataPublicationsInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
): UseInfiniteQueryResult<DataPublication[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery(
    [
      'dataPublication',
      { sort: JSON.stringify(sort), filters }, // need to stringify sort as property order is important!
      additionalFilters,
    ],
    (params) => {
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchDataPublications(
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

export const useDataPublication = (
  dataPublicationId: number,
  queryOptions?: UseQueryOptions<
    DataPublication[],
    AxiosError,
    DataPublication,
    [string, number]
  >
): UseQueryResult<DataPublication, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery(
    ['dataPublication', dataPublicationId],
    () => {
      return fetchDataPublications(apiUrl, { sort: {}, filters: {} }, [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { eq: dataPublicationId },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify([
            {
              content: {
                dataCollectionInvestigations: {
                  investigation: [
                    'datasets',
                    {
                      datasets: 'type',
                      investigationInstruments: 'instrument',
                    },
                  ],
                },
              },
            },
            'users',
            'facility',
            'dates',
          ]),
        },
      ]);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      select: (data) => data[0],
      ...queryOptions,
    }
  );
};

export const useDataPublications = (
  additionalFilters: AdditionalFilters
): UseQueryResult<DataPublication[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<
    DataPublication[],
    AxiosError,
    DataPublication[],
    [string, AdditionalFilters?]
  >(
    ['dataPublication', additionalFilters],
    (params) => {
      return fetchDataPublications(
        apiUrl,
        { sort: {}, filters: {} },
        additionalFilters
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

const fetchDataPublicationCount = (
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
    .get(`${apiUrl}/datapublications/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useDataPublicationCount = (
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
    ['count', 'dataPublication', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchDataPublicationCount(apiUrl, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};
