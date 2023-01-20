import axios, { AxiosError } from 'axios';
import { getApiParams, parseSearchToQuery } from '.';
import { readSciGatewayToken } from '../parseTokens';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import handleICATError from '../handleICATError';
import {
  AdditionalFilters,
  FiltersType,
  Dataset,
  SortType,
} from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from 'react-query';
import retryICATErrors from './retryICATErrors';

const fetchDatasets = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange
): Promise<Dataset[]> => {
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

export const useDataset = (
  datasetId: number,
  additionalFilters?: AdditionalFilters
): UseQueryResult<Dataset[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<
    Dataset[],
    AxiosError,
    Dataset[],
    [string, number, AdditionalFilters?]
  >(
    ['dataset', datasetId, additionalFilters],
    (params) => {
      return fetchDatasets(apiUrl, { sort: {}, filters: {} }, [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { eq: datasetId },
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

export const useDatasetsPaginated = (
  additionalFilters?: AdditionalFilters
): UseQueryResult<Dataset[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    Dataset[],
    AxiosError,
    Dataset[],
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
      'dataset',
      { sort, filters, page: page ?? 1, results: results ?? 10 },
      additionalFilters,
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchDatasets(apiUrl, { sort, filters }, additionalFilters, {
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

export const useDatasetsInfinite = (
  additionalFilters?: AdditionalFilters
): UseInfiniteQueryResult<Dataset[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    Dataset[],
    AxiosError,
    Dataset[],
    [string, { sort: SortType; filters: FiltersType }, AdditionalFilters?]
  >(
    ['dataset', { sort, filters }, additionalFilters],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchDatasets(
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

export const useDatasetCount = (
  additionalFilters?: AdditionalFilters,
  storedFilters?: FiltersType,
  currentTab?: string
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const filters =
    currentTab === 'dataset' || !storedFilters
      ? parseSearchToQuery(location.search).filters
      : storedFilters;

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, { filters: FiltersType }, AdditionalFilters?]
  >(
    ['count', 'dataset', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchDatasetCountQuery(apiUrl, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

const fetchDatasetDetails = (
  apiUrl: string,
  datasetId: number
): Promise<Dataset> => {
  const params = new URLSearchParams();
  params.append('where', JSON.stringify({ id: { eq: datasetId } }));
  params.append('include', JSON.stringify('type'));

  return axios
    .get(`${apiUrl}/datasets`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data[0]);
};

export const useDatasetDetails = (
  datasetId: number
): UseQueryResult<Dataset, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<Dataset, AxiosError, Dataset, [string, number]>(
    ['datasetDetails', datasetId],
    (params) => fetchDatasetDetails(apiUrl, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
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
