import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  AdditionalFilters,
  DataPublication,
  Datafile,
  Dataset,
  FiltersType,
  Investigation,
  SkipAndLimitType,
  SortType,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
import { fetchDatafileCountQuery, fetchDatafiles } from './datafiles';
import { fetchDatasetCountQuery, fetchDatasets } from './datasets';
import { getApiParams, parseSearchToQuery } from './index';
import { fetchInvestigationCount, fetchInvestigations } from './investigations';
import { useRetryICATErrors } from './retryICATErrors';

const fetchDataPublications = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  skipAndLimit?: SkipAndLimitType
): Promise<DataPublication[]> => {
  const params = getApiParams(sortAndFilters);

  if (skipAndLimit) {
    params.append('skip', JSON.stringify(skipAndLimit.skip));
    params.append('limit', JSON.stringify(skipAndLimit.limit));
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
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'dataPublication',
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
      return fetchDataPublications(
        apiUrl,
        { sort, filters },
        additionalFilters,
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

export const useDataPublicationsInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'dataPublication',
      { sort: JSON.stringify(sort), filters }, // need to stringify sort as property order is important!
      additionalFilters,
      apiUrl,
    ],
    queryFn: (params) =>
      fetchDataPublications(
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

export const useDataPublication = (
  dataPublicationId?: number,
  enabled?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['dataPublication', dataPublicationId ?? -1, apiUrl],
    queryFn: () => {
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
                      investigationUsers: 'user',
                    },
                  ],
                },
                dataCollectionDatasets: 'dataset',
                dataCollectionDatafiles: 'datafile',
              },
              relatedItems: 'publication',
              users: ['user', 'affiliations'],
            },
            'facility',
            'dates',
            'type',
          ]),
        },
      ]);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: enabled ?? typeof dataPublicationId !== 'undefined',
    select: (data) => data[0],
  });
};

export const useDataPublicationsByFilters = (
  additionalFilters: AdditionalFilters,
  enabled?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: ['dataPublication', additionalFilters, apiUrl],
    queryFn: (_params) => {
      return fetchDataPublications(
        apiUrl,
        { sort: {}, filters: {} },
        additionalFilters
      );
    },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled,
  });
};

export const useDataPublicationContent = (
  dataPublicationId: string,
  entityType: 'investigation' | 'dataset' | 'datafile'
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'dataPublicationContent',
      entityType,
      dataPublicationId,
      { sort, filters },
    ] as const,
    queryFn: (params): Promise<Investigation[] | Dataset[] | Datafile[]> => {
      const { sort, filters } = params.queryKey[3];
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
          params.pageParam
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
          params.pageParam
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
          params.pageParam
        );
      } else {
        // shouldn't happen - just feels better to explicity check entityType
        return Promise.reject();
      }
    },
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => ({
      skip: lastPageParam.skip + lastPageParam.limit,
      limit: INFINITE_SCROLL_BATCH_SIZE,
    }),
    initialPageParam: { skip: 0, limit: 50 },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};

export const useDataPublicationContentCount = (
  dataPublicationId: string,
  entityType: 'investigation' | 'dataset' | 'datafile'
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'dataPublicationContentCount',
      entityType,
      dataPublicationId,
      filters,
    ],
    queryFn: () => {
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
    meta: { icatError: true },
    retry: retryICATErrors,
  });
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
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'count',
      'dataPublication',
      { filters },
      additionalFilters,
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[2];
      return fetchDataPublicationCount(apiUrl, filters, additionalFilters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};
