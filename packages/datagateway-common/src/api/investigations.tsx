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
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

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
  // TODO: add onSuccess to go through size query cache?
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
  // TODO: add onSuccess to go through size query cache?
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

export const useInvestigationSizes = (
  data: Investigation[] | InfiniteData<Investigation[]> | undefined,
  additionalFilters?: AdditionalFilters
): UseQueryResult<unknown, unknown>[] => {
  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const queryClient = useQueryClient();

  let queries: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['investigationSize', number]
  >[] = [];

  // check if we're from an infinite query or not to determine the way the data
  // needs to be iterated as well as the onSuccess function
  // TODO: does this work?
  if (data && 'pages' in data) {
    queries = data.pages.flat().map((investigation) => {
      return {
        queryKey: ['investigationSize', investigation.id],
        queryFn: () =>
          fetchInvestigationSize(
            { facilityName, downloadApiUrl },
            investigation.id
          ),
        onSuccess: (data: number) => {
          queryClient.setQueryData<InfiniteData<Investigation[]>>(
            ['investigation', { sort, filters }, additionalFilters],
            (oldData) => {
              return {
                ...oldData,
                pageParams: oldData?.pageParams ?? [],
                pages:
                  oldData?.pages.map((page) =>
                    page.map((oldInvestigation) => {
                      return oldInvestigation.id === investigation.id
                        ? { ...oldInvestigation, size: data }
                        : oldInvestigation;
                    })
                  ) ?? [],
              };
            }
          );
        },
        onError: (error) => {
          handleICATError(error, false);
        },
        staleTime: Infinity,
      };
    });
  } else if (data) {
    queries = data.map((investigation) => {
      return {
        queryKey: ['investigationSize', investigation.id],
        queryFn: () =>
          fetchInvestigationSize(
            { facilityName, downloadApiUrl },
            investigation.id
          ),
        onSuccess: (data: number) => {
          queryClient.setQueryData<Investigation[]>(
            [
              'investigation',
              { sort, filters, page: page || 1, results: results || 10 },
              additionalFilters,
            ],
            (oldData) => {
              return (
                oldData?.map((oldInvestigation) => {
                  return oldInvestigation.id === investigation.id
                    ? { ...oldInvestigation, size: data }
                    : oldInvestigation;
                }) ?? []
              );
            }
          );
        },
        onError: (error) => {
          handleICATError(error, false);
        },
        staleTime: Infinity,
      };
    });
  }

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return useQueries(queries);
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
    [string, { filters: FiltersType }, AdditionalFilters?]
  >(
    ['investigationCount', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[1];
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
