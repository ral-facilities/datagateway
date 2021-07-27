import React from 'react';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import {
  AdditionalFilters,
  FiltersType,
  Investigation,
  SortType,
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
import { fetchDatasetCount } from './datasets';
import useDeepCompareEffect from 'use-deep-compare-effect';

const fetchInvestigations = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange
): Promise<Investigation[]> => {
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
  additionalFilters?: AdditionalFilters
): UseQueryResult<Investigation[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    Investigation[],
    AxiosError,
    Investigation[],
    [
      string,
      {
        sort: SortType;
        filters: FiltersType;
        page: number;
        results: number | null;
      },
      AdditionalFilters?
    ]
  >(
    [
      'investigation',
      { sort, filters, page: page || 1, results: results || 10 },
      additionalFilters,
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * (results ?? 10);
      const stopIndex = startIndex + (results ?? 10) - 1;
      return fetchInvestigations(apiUrl, { sort, filters }, additionalFilters, {
        startIndex,
        stopIndex,
      });
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const useInvestigationsInfinite = (
  additionalFilters?: AdditionalFilters
): UseInfiniteQueryResult<Investigation[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    Investigation[],
    AxiosError,
    Investigation[],
    [string, { sort: SortType; filters: FiltersType }, AdditionalFilters?]
  >(
    ['investigation', { sort, filters }, additionalFilters],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchInvestigations(
        apiUrl,
        { sort, filters },
        additionalFilters,
        offsetParams
      );
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length >= 25) {
          return true;
        } else {
          return undefined;
        }
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const fetchInvestigationSize = (
  config: {
    facilityName: string;
    downloadApiUrl: string;
  },
  investigationId: number
): Promise<number> => {
  // Make use of the facility name and download API url for the request.
  const { facilityName, downloadApiUrl } = config;
  return axios
    .get(`${downloadApiUrl}/user/getSize`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: facilityName,
        entityType: 'investigation',
        entityId: investigationId,
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
export const useInvestigationSize = (
  investigationId: number
): UseQueryResult<number, AxiosError> => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );

  return useQuery<number, AxiosError, number, [string, number]>(
    ['investigationSize', investigationId],
    (params) =>
      fetchInvestigationSize(
        { facilityName, downloadApiUrl },
        params.queryKey[1]
      ),
    {
      onError: (error) => {
        handleICATError(error);
      },
      enabled: false,
    }
  );
};

export const useInvestigationSizes = (
  data: Investigation[] | InfiniteData<Investigation[]> | undefined
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
    ['investigationSize', number]
  >[] = React.useMemo(() => {
    // check if we're from an infinite query or not to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data
      : [];

    return aggregatedData.map((investigation) => {
      return {
        queryKey: ['investigationSize', investigation.id],
        queryFn: () =>
          fetchInvestigationSize(
            { facilityName, downloadApiUrl },
            investigation.id
          ),
        onError: (error) => {
          handleICATError(error, false);
        },
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
  }, [queries]);

  return sizes;
};

export const useInvestigationsDatasetCount = (
  data: Investigation[] | InfiniteData<Investigation[]> | undefined
): UseQueryResult<number, AxiosError>[] => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['investigationDatasetCount', number]
  >[] = React.useMemo(() => {
    // check if we're from an infinite query or not to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data
      : [];

    return aggregatedData.map((investigation) => {
      return {
        queryKey: ['investigationDatasetCount', investigation.id],
        queryFn: () =>
          fetchDatasetCount(apiUrl, {}, [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'investigation.id': { eq: investigation.id },
              }),
            },
          ]),
        onError: (error) => {
          handleICATError(error, false);
        },
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

  const [datasetCounts, setDatasetCounts] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);
  // need to use useDeepCompareEffect here because the array returned by useQueries
  // is different every time this hook runs
  useDeepCompareEffect(() => {
    const currCountReturned = queries.reduce(
      (acc, curr) => acc + (curr.isFetched ? 1 : 0),
      0
    );
    const batchMax =
      datasetCounts.length - currCountReturned < 5
        ? datasetCounts.length - currCountReturned
        : 5;
    // this in effect batches our updates to only happen in batches >= 5
    if (currCountReturned - countAppliedRef.current >= batchMax) {
      setDatasetCounts(queries);
      countAppliedRef.current = currCountReturned;
    }
  }, [queries]);

  return datasetCounts;
};

const fetchInvestigationCount = (
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
  const { filters } = parseSearchToQuery(location.search);

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
      placeholderData: 0,
      onError: (error) => {
        handleICATError(error);
      },
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
    JSON.stringify([{ investigationUsers: 'user' }, 'samples', 'publications'])
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

  return useQuery<Investigation, AxiosError, Investigation, [string, number]>(
    ['investigationDetails', investigationId],
    (params) => fetchInvestigationDetails(apiUrl, params.queryKey[1]),
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};
