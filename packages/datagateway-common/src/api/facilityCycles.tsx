import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery } from '.';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { FiltersType, FacilityCycle, SortType } from '../app.types';
import { StateType } from '../state/app.types';
import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from 'react-query';

const fetchFacilityCycles = (
  apiUrl: string,
  instrumentId: number,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  offsetParams?: IndexRange
): Promise<FacilityCycle[]> => {
  const params = getApiParams(sortAndFilters);

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  return axios
    .get(`${apiUrl}/instruments/${instrumentId}/facilitycycles`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

const fetchAllFacilityCycles = (apiUrl: string): Promise<FacilityCycle[]> => {
  return axios
    .get(`${apiUrl}/facilitycycles`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useAllFacilityCycles = (
  enabled?: boolean
): UseQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<FacilityCycle[], AxiosError, FacilityCycle[], string>(
    'facilityCycle',
    () => fetchAllFacilityCycles(apiUrl),
    {
      onError: (error) => {
        handleICATError(error);
      },
      enabled,
    }
  );
};

const fetchFacilityCyclesByInvestigation = (
  apiUrl: string,
  investigationStartDate: string | undefined
): Promise<FacilityCycle[]> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({ startDate: { lte: investigationStartDate } })
  );
  params.append(
    'where',
    JSON.stringify({ endDate: { gte: investigationStartDate } })
  );
  return axios
    .get(`${apiUrl}/facilitycycles`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useFacilityCyclesByInvestigation = (
  investigationStartDate?: string
): UseQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<
    FacilityCycle[],
    AxiosError,
    FacilityCycle[],
    [string, string?]
  >(
    ['facilityCycle', investigationStartDate],
    () => fetchFacilityCyclesByInvestigation(apiUrl, investigationStartDate),
    {
      onError: (error) => {
        handleICATError(error);
      },
      enabled: !!investigationStartDate,
    }
  );
};

export const useFacilityCyclesPaginated = (
  instrumentId: number
): UseQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    FacilityCycle[],
    AxiosError,
    FacilityCycle[],
    [
      string,
      number,
      {
        sort: SortType;
        filters: FiltersType;
        page: number;
        results: number;
      }
    ]
  >(
    [
      'facilityCycle',
      instrumentId,
      { sort, filters, page: page ?? 1, results: results ?? 10 },
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[2];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchFacilityCycles(
        apiUrl,
        instrumentId,
        { sort, filters },
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
    }
  );
};

export const useFacilityCyclesInfinite = (
  instrumentId: number
): UseInfiniteQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    FacilityCycle[],
    AxiosError,
    FacilityCycle[],
    [string, number, { sort: SortType; filters: FiltersType }]
  >(
    ['facilityCycle', instrumentId, { sort, filters }],
    (params) => {
      const { sort, filters } = params.queryKey[2];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchFacilityCycles(
        apiUrl,
        instrumentId,
        { sort, filters },
        offsetParams
      );
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const fetchFacilityCycleCount = (
  apiUrl: string,
  instrumentId: number,
  filters: FiltersType
): Promise<number> => {
  const params = getApiParams({ filters, sort: {} });
  params.delete('order');

  return axios
    .get(`${apiUrl}/instruments/${instrumentId}/facilitycycles/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useFacilityCycleCount = (
  instrumentId: number
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, number, { filters: FiltersType }]
  >(
    ['count', 'facilityCycle', instrumentId, { filters }],
    (params) => {
      const { filters } = params.queryKey[3];
      return fetchFacilityCycleCount(apiUrl, instrumentId, filters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};
