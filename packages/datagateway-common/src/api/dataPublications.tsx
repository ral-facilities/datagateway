import {
  AdditionalFilters,
  Datafile,
  Dataset,
  DataPublication,
  FiltersType,
  Investigation,
  SortType,
} from '../app.types';
import axios, { AxiosError } from 'axios';
import { StateType } from '../state/app.types';
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
import {
  fetchDatafileCountQuery,
  fetchDatafiles,
  fetchDatasetCountQuery,
  fetchDatasets,
  fetchInvestigationCount,
  fetchInvestigations,
  getApiParams,
  parseSearchToQuery,
} from '.';
import { useRetryICATErrors } from './retryICATErrors';

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
      if (filter.filterType === 'order') {
        const existingSorts = params.getAll('order');
        params.delete('order');
        params.append('order', filter.filterValue);
        existingSorts.forEach((v) => params.append('order', v));
      } else params.append(filter.filterType, filter.filterValue);
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
  const retryICATErrors = useRetryICATErrors();

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
  const retryICATErrors = useRetryICATErrors();

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
  dataPublicationId?: number,
  queryOptions?: UseQueryOptions<
    DataPublication[],
    AxiosError,
    DataPublication,
    [string, number]
  >
): UseQueryResult<DataPublication, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery(
    ['dataPublication', dataPublicationId ?? -1],
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
                dataCollectionDatasets: 'dataset',
                dataCollectionDatafiles: 'datafile',
              },
              relatedItems: 'publication',
              users: 'user',
            },
            'users',
            'facility',
            'dates',
            'type',
          ]),
        },
      ]);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      enabled: typeof dataPublicationId !== 'undefined',
      select: (data) => data[0],
      ...queryOptions,
    }
  );
};

export const useDataPublicationsByFilters = (
  additionalFilters: AdditionalFilters,
  queryOptions?: UseQueryOptions<
    DataPublication[],
    AxiosError,
    DataPublication[],
    [string, AdditionalFilters]
  >
): UseQueryResult<DataPublication[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery(
    ['dataPublication', additionalFilters],
    () => {
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
      ...queryOptions,
    }
  );
};

export const useDataPublicationContent = (
  dataPublicationId: string,
  entityType: 'investigation' | 'dataset' | 'datafile'
): UseInfiniteQueryResult<
  (Investigation | Dataset | Datafile)[],
  AxiosError
> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery<
    (Investigation | Dataset | Datafile)[],
    AxiosError,
    (Investigation | Dataset | Datafile)[],
    [string, string, string, { sort: SortType; filters: FiltersType }]
  >(
    [
      'dataPublicationContent',
      entityType,
      dataPublicationId,
      { sort, filters },
    ],
    (params) => {
      const { sort, filters } = params.queryKey[3];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      if (entityType === 'investigation') {
        return fetchInvestigations(
          apiUrl,
          { sort, filters },
          [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'dataCollectionInvestigations.dataCollection.dataPublications.id':
                  { eq: dataPublicationId },
              }),
            },
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                investigationInstruments: 'instrument',
              }),
            },
          ],
          offsetParams
        );
      }
      if (entityType === 'dataset') {
        return fetchDatasets(
          apiUrl,
          { sort, filters },
          [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'dataCollectionDatasets.dataCollection.dataPublications.id': {
                  eq: dataPublicationId,
                },
              }),
            },
          ],
          offsetParams
        );
      }
      if (entityType === 'datafile') {
        return fetchDatafiles(
          apiUrl,
          { sort, filters },
          [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'dataCollectionDatafiles.dataCollection.dataPublications.id': {
                  eq: dataPublicationId,
                },
              }),
            },
          ],
          offsetParams
        );
      } else {
        // shouldn't happen - just feels better to explicity check entityType
        return Promise.reject();
      }
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

export const useDataPublicationContentCount = (
  dataPublicationId: string,
  entityType: 'investigation' | 'dataset' | 'datafile'
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery(
    ['dataPublicationContentCount', entityType, dataPublicationId, filters],
    () => {
      if (entityType === 'investigation') {
        return fetchInvestigationCount(apiUrl, filters, [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'dataCollectionInvestigations.dataCollection.dataPublications.id':
                { eq: dataPublicationId },
            }),
          },
        ]);
      }
      if (entityType === 'dataset') {
        return fetchDatasetCountQuery(apiUrl, filters, [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'dataCollectionDatasets.dataCollection.dataPublications.id': {
                eq: dataPublicationId,
              },
            }),
          },
        ]);
      }
      if (entityType === 'datafile') {
        return fetchDatafileCountQuery(apiUrl, filters, [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'dataCollectionDatafiles.dataCollection.dataPublications.id': {
                eq: dataPublicationId,
              },
            }),
          },
        ]);
      } else {
        // shouldn't happen - just feels better to explicity check entityType
        return Promise.reject();
      }
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
  const retryICATErrors = useRetryICATErrors();

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
