import axios, { AxiosError } from 'axios';
import { format, set } from 'date-fns';
import {
  type UseInfiniteQueryResult,
  type UseInfiniteQueryOptions,
  type UseQueryResult,
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
} from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '..';
import { FiltersType, SearchResultSource, SortType } from '../app.types';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import retryICATErrors from './retryICATErrors';

interface QueryParameters {
  target: string;
  text?: string;
  lower?: string;
  upper?: string;
  filter?: object;
  facets?: object[];
}

export type DatasearchType = 'Investigation' | 'Dataset' | 'Datafile';

export type LuceneSearchParams = UrlBuilderParameters & {
  sort?: SortType;
  search_after?: SearchAfter;
  minCount?: number;
  maxCount?: number;
  restrict?: boolean;
};

interface UrlBuilderParameters {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
  filters?: FiltersType;
  facets?: FacetRequest[];
}

interface SearchAfter {
  doc: number;
  shardIndex: number;
  score: number;
  fields: [];
}

export interface FacetRequest {
  target: string;
  dimensions?: DimensionRequest[];
}

interface DimensionRequest {
  dimension: string;
  ranges?: RangeRequest[];
}

interface RangeRequest {
  from?: number;
  to?: number;
  key?: string;
}

export interface SearchResult {
  id: number;
  score: number;
  source: SearchResultSource;
}

interface RangeFacetResponse {
  count: number;
  from?: number;
  to?: number;
}

export interface SearchFacet {
  [dimension: string]: { [label: string]: number | RangeFacetResponse };
}

export interface SearchResponse {
  results?: SearchResult[];
  search_after?: SearchAfter;
  dimensions?: SearchFacet;
  aborted?: boolean;
}

const urlParamsBuilder = (
  datasearchtype: DatasearchType,
  params: UrlBuilderParameters
): QueryParameters => {
  const query: QueryParameters = {
    target: datasearchtype,
  };

  if (params.startDate !== null || params.endDate !== null) {
    query.lower =
      params.startDate !== null
        ? format(
            set(params.startDate, { hours: 0, minutes: 0 }),
            'yyyyMMddHHmm'
          )
        : '0000001010000';

    query.upper =
      params.endDate !== null
        ? format(
            set(params.endDate, { hours: 23, minutes: 59 }),
            'yyyyMMddHHmm'
          )
        : '9000012312359';
  }

  if (params.filters && Object.entries(params.filters).length > 0) {
    query.filter = params.filters;
  }

  if (params.searchText.length > 0) {
    query.text = params.searchText;
  }

  if (params.facets) {
    query.facets = params.facets;
  }

  // return query.
  return query;
};

export const fetchLuceneData = async (
  datasearchType: DatasearchType,
  params: LuceneSearchParams,
  settings: {
    icatUrl: string;
  }
): Promise<SearchResponse> => {
  // Query params.
  const queryParams = {
    sessionId: readSciGatewayToken().sessionId,
    query: urlParamsBuilder(datasearchType, params),
    // Default maximum count is 300.
    sort: params.sort ? params.sort : '',
    search_after: params.search_after ? params.search_after : '',
    minCount: params.minCount ? params.minCount : 10,
    maxCount: params.maxCount ? params.maxCount : 100,
    restrict: !!params.restrict,
  };

  return axios
    .get(`${settings.icatUrl}/search/documents`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const fetchLuceneFacets = async (
  datasearchType: DatasearchType,
  facets: FacetRequest[],
  filters: FiltersType,
  settings: {
    icatUrl: string;
  }
): Promise<SearchResponse> => {
  const queryParams = {
    sessionId: readSciGatewayToken().sessionId,
    query: { target: datasearchType, facets: facets, filter: filters },
  };

  return axios
    .get(`${settings.icatUrl}/facet/documents`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useLuceneFacet = <TSelectData,>(
  datasearchType: DatasearchType,
  facetRequests: FacetRequest[],
  facetFilters: FiltersType,
  options: UseQueryOptions<
    SearchResponse,
    AxiosError,
    TSelectData,
    [string, DatasearchType, FacetRequest[], FiltersType]
  > = {}
): UseQueryResult<TSelectData, AxiosError> => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  return useQuery<
    SearchResponse,
    AxiosError,
    TSelectData,
    [string, DatasearchType, FacetRequest[], FiltersType]
  >(
    ['facet', datasearchType, facetRequests, facetFilters],
    (queryFunctionContext) => {
      return fetchLuceneFacets(
        queryFunctionContext.queryKey[1],
        queryFunctionContext.queryKey[2],
        queryFunctionContext.queryKey[3],
        { icatUrl }
      );
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      getNextPageParam: (lastPage, _) => lastPage.search_after,
      ...options,
    }
  );
};

export const useLuceneSearchInfinite = (
  datasearchType: DatasearchType,
  luceneParams: LuceneSearchParams,
  facetFilters: FiltersType,
  options?: UseInfiniteQueryOptions<
    SearchResponse,
    AxiosError,
    SearchResponse,
    SearchResponse,
    [string, DatasearchType, LuceneSearchParams]
  >
): UseInfiniteQueryResult<SearchResponse, AxiosError> => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  if (facetFilters) {
    // only applies filters if the filter key starts with the data type this is searching
    // e.g. if there are dataset.type.name & investigation.type.name in filter keys,
    // and we are searching investigation, only investigation.type.name will be added to the final filter object.
    luceneParams.filters = Object.entries(facetFilters).reduce<FiltersType>(
      (filters, [filterKey, filterValue]) => {
        if (filterKey.startsWith(datasearchType.toLocaleLowerCase())) {
          filters[filterKey] = filterValue;
        }
        return filters;
      },
      {}
    );
  }

  return useInfiniteQuery<
    SearchResponse,
    AxiosError,
    SearchResponse,
    [string, DatasearchType, LuceneSearchParams]
  >(
    ['search', datasearchType, luceneParams],
    () => fetchLuceneData(datasearchType, luceneParams, { icatUrl }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      getNextPageParam: (lastPage, _) => lastPage.search_after,
      ...(options ?? {}),
    }
  );
};
