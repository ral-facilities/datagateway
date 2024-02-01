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
  SuggestedInvestigation,
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
import { fetchDatasetCountQuery } from './datasets';
import useDeepCompareEffect from 'use-deep-compare-effect';
import retryICATErrors from './retryICATErrors';

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

  return useQuery<
    Investigation[],
    AxiosError,
    Investigation[],
    [string, number, AdditionalFilters?, boolean?]
  >(
    ['investigation', investigationId, additionalFilters],
    (params) => {
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
      retry: retryICATErrors,
      enabled: false,
    }
  );
};

export const useInvestigationSizes = (
  data:
    | Investigation[]
    | InfiniteData<Investigation[]>
    | Investigation
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
    ['investigationSize', number]
  >[] = React.useMemo(() => {
    // check the type of the data parameter to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data instanceof Array
        ? data
        : [data]
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

export const useInvestigationsDatasetCount = (
  data:
    | Investigation[]
    | InfiniteData<Investigation[]>
    | Investigation
    | undefined
): UseQueryResult<number, AxiosError>[] => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['investigationDatasetCount', number]
  >[] = React.useMemo(() => {
    // check the type of the data parameter to determine the way the data needs to be iterated
    const aggregatedData = data
      ? 'pages' in data
        ? data.pages.flat()
        : data instanceof Array
        ? data
        : [data]
      : [];

    return aggregatedData.map((investigation) => {
      return {
        queryKey: ['investigationDatasetCount', investigation.id],
        queryFn: () =>
          fetchDatasetCountQuery(apiUrl, {}, [
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

  const [datasetCounts, setDatasetCounts] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);

  // when data changes (i.e. due to sorting or filtering) set the countAppliedRef
  // back to 0 so we can restart the process, as well as clear datasetCounts
  React.useEffect(() => {
    countAppliedRef.current = 0;
    setDatasetCounts([]);
  }, [data]);

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
  }, [datasetCounts, queries]);

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
  additionalFilters?: AdditionalFilters,
  storedFilters?: FiltersType,
  currentTab?: string
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const filters =
    currentTab === 'investigation' || !storedFilters
      ? parseSearchToQuery(location.search).filters
      : storedFilters;

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

export const useSimilarInvestigations = ({
  investigation,
}: {
  investigation: Investigation;
}): UseQueryResult<SuggestedInvestigation[], AxiosError> => {
  // TODO: Remove this hardcoded URL
  const baseUrl = 'http://172.16.103.71:4001/api';

  return useQuery<
    SuggestedInvestigation[],
    AxiosError,
    SuggestedInvestigation[],
    ['similarInvestigations', Investigation['id']]
  >(
    ['similarInvestigations', investigation.id],
    () =>
      axios
        .get<SuggestedInvestigation[]>(
          `/v2/similar/doc/?id=${investigation.id}`,
          {
            baseURL: baseUrl,
          }
        )
        .then((response) => response.data),
    {
      select: (data) => {
        data.sort((resultA, resultB) => resultB.score - resultA.score);
        return data;
      },
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};
