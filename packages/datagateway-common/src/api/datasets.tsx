import React from 'react';
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
  SearchResultSource,
} from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
  useQueries,
  UseQueryOptions,
} from 'react-query';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { fetchDatafileCountQuery } from './datafiles';
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

const fetchDatasetSize = (
  config: {
    facilityName: string;
    downloadApiUrl: string;
  },
  datasetId: number
): Promise<number> => {
  // Make use of the facility name and download API url for the request.
  const { facilityName, downloadApiUrl } = config;
  return axios
    .get(`${downloadApiUrl}/user/getSize`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
        entityType: 'dataset',
        entityId: datasetId,
      },
    })
    .then((response) => {
      return response.data;
    });
};

/**
 * For use with DLS button fetch size functionality
 * via using the refetch function returned by useQuery
 * Hence why the query is disabled by default
 */
export const useDatasetSize = (
  datasetId: number
): UseQueryResult<number, AxiosError> => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  return useQuery<number, AxiosError, number, [string, number]>(
    ['datasetSize', datasetId],
    (params) =>
      fetchDatasetSize({ facilityName, downloadApiUrl }, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,

      enabled: false,
    }
  );
};

export const useDatasetSizes = (
  data:
    | Dataset[]
    | InfiniteData<Dataset[]>
    | Dataset
    | SearchResultSource[]
    | undefined
): UseQueryResult<number, AxiosError>[] => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['datasetSize', number]
  >[] = React.useMemo(() => {
    // check the type of the data parameter to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data instanceof Array
        ? data
        : [data]
      : [];

    return aggregatedData.map((dataset) => {
      return {
        queryKey: ['datasetSize', dataset.id],
        queryFn: () =>
          fetchDatasetSize({ facilityName, downloadApiUrl }, dataset.id),
        onError: (error) => {
          handleICATError(error, false);
        },
        retry: retryICATErrors,
        staleTime: Infinity,
      };
    });
  }, [data, facilityName, downloadApiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  const [sizes, setSizes] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);

  // when data changes (i.e. due to sorting or filtering) set the countAppliedRef
  // back to 0 so we can restart the process, as well as clear sizes
  React.useEffect(() => {
    countAppliedRef.current = 0;
    setSizes([]);
  }, [data]);

  // need to use useDeepCompareEffect here because the array returned by useQueries
  // is different every time this hook runs
  useDeepCompareEffect(() => {
    const currCountReturned = queries.reduce(
      (acc, curr) => acc + (curr.isFetched ? 1 : 0),
      0
    );
    const batchMax =
      sizes.length - currCountReturned < 5
        ? sizes.length - currCountReturned
        : 5;
    // this in effect batches our updates to only happen in batches >= 5
    if (currCountReturned - countAppliedRef.current >= batchMax) {
      setSizes(queries);
      countAppliedRef.current = currCountReturned;
    }
  }, [sizes, queries]);

  return sizes;
};
export const useDatasetsDatafileCount = (
  data:
    | Dataset[]
    | InfiniteData<Dataset[]>
    | Dataset
    | SearchResultSource[]
    | undefined
): UseQueryResult<number, AxiosError>[] => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['datasetDatafileCount', number]
  >[] = React.useMemo(() => {
    // check the type of the data parameter to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data instanceof Array
        ? data
        : [data]
      : [];

    return aggregatedData.map((dataset) => {
      return {
        queryKey: ['datasetDatafileCount', dataset.id],
        queryFn: () =>
          fetchDatafileCountQuery(apiUrl, {}, [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'dataset.id': { eq: dataset.id },
              }),
            },
          ]),
        onError: (error) => {
          handleICATError(error, false);
        },
        retry: retryICATErrors,
        staleTime: Infinity,
      };
    });
  }, [data, apiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  const [datafileCounts, setDatafileCounts] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);

  // when data changes (i.e. due to sorting or filtering) set the countAppliedRef
  // back to 0 so we can restart the process, as well as clear datafileCounts
  React.useEffect(() => {
    countAppliedRef.current = 0;
    setDatafileCounts([]);
  }, [data]);

  // need to use useDeepCompareEffect here because the array returned by useQueries
  // is different every time this hook runs
  useDeepCompareEffect(() => {
    const currCountReturned = queries.reduce(
      (acc, curr) => acc + (curr.isFetched ? 1 : 0),
      0
    );
    const batchMax =
      datafileCounts.length - currCountReturned < 5
        ? datafileCounts.length - currCountReturned
        : 5;
    // this in effect batches our updates to only happen in batches >= 5
    if (currCountReturned - countAppliedRef.current >= batchMax) {
      setDatafileCounts(queries);
      countAppliedRef.current = currCountReturned;
    }
  }, [datafileCounts, queries]);

  return datafileCounts;
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
