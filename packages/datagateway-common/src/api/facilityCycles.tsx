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
} from '@tanstack/react-query';
import { useRetryICATErrors } from './retryICATErrors';

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

  params.append(
    'where',
    JSON.stringify({
      'investigationFacilityCycles.investigation.investigationInstruments.instrument.id':
        {
          eq: instrumentId,
        },
    })
  );
  // Distinct is needed as otherwise it returns duplicate cycles for every cycle with a unique investigation with the matching instrument id
  params.append(
    'distinct',
    JSON.stringify(['id', 'name', 'startDate', 'endDate'])
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

export const fetchAllFacilityCycles = (
  apiUrl: string
): Promise<FacilityCycle[]> => {
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
  const retryICATErrors = useRetryICATErrors();

  return useQuery<FacilityCycle[], AxiosError, FacilityCycle[], string[]>(
    ['facilityCycle'],
    () => fetchAllFacilityCycles(apiUrl),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      enabled,
    }
  );
};

export const useFacilityCyclesPaginated = (
  instrumentId: number,
  isMounted?: boolean
): UseQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    FacilityCycle[],
    AxiosError,
    FacilityCycle[],
    [
      string,
      number,
      {
        sort: string;
        filters: FiltersType;
        page: number;
        results: number;
      }
    ]
  >(
    [
      'facilityCycle',
      instrumentId,
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
    ],
    (params) => {
      const { page, results } = params.queryKey[2];
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
      retry: retryICATErrors,
      enabled: isMounted ?? true,
    }
  );
};

export const useFacilityCyclesInfinite = (
  instrumentId: number,
  isMounted?: boolean
): UseInfiniteQueryResult<FacilityCycle[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery(
    ['facilityCycle', instrumentId, { sort: JSON.stringify(sort), filters }],
    (params) => {
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
      retry: retryICATErrors,
      enabled: isMounted ?? true,
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

  params.append(
    'where',
    JSON.stringify({
      'investigationFacilityCycles.investigation.investigationInstruments.instrument.id':
        {
          eq: instrumentId,
        },
    })
  );
  // Distinct is needed as otherwise it returns duplicate cycles for every cycle with a unique investigation with the matching instrument id
  params.append(
    'distinct',
    JSON.stringify(['id', 'name', 'startDate', 'endDate'])
  );

  return axios
    .get(`${apiUrl}/facilitycycles/count`, {
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
  const retryICATErrors = useRetryICATErrors();

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
      retry: retryICATErrors,
    }
  );
};
