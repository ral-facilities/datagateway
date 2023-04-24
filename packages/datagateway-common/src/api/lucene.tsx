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
import { StateType } from '../state/app.types';
import { NotificationType } from '../state/actions/actions.types';
import {
  MicroFrontendId,
  FiltersType,
  SearchResultSource,
  SortType,
} from '../app.types';
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

/**
 * Defines different error codes that the Lucene backend can return.
 */
export const LUCENE_ERROR_CODE = {
  badParameter: 'BAD_PARAMETER',
  internal: 'INTERNAL',
} as const;

/**
 * Union of error codes that the Lucene backend can return.
 */
export type LuceneErrorCode =
  | typeof LUCENE_ERROR_CODE[keyof typeof LUCENE_ERROR_CODE]
  // there are other icat specific errors as well,
  // but no point coding them in if they aren't handled specially
  // in the future, update LUCENE_ERROR_CODE as needed if other error codes require special handling.
  | string;

/**
 * A more specific version of ICAT error that can be returned when performing Lucene searches.
 */
export interface LuceneError {
  code: LuceneErrorCode;
  message: string;
}

/**
 * Provides special handling for some Lucene errors. For all other ICAT/Lucene errors, the error is forwarded to handleICATError.
 */
const handleLuceneError = (error: AxiosError<LuceneError>): void => {
  const errorResponse = error.response;
  if (!errorResponse) {
    handleICATError(error);
    return;
  }

  const { code, message } = errorResponse.data;
  switch (code) {
    case 'BAD_PARAMETER':
      // handle bad search query

      document.dispatchEvent(
        new CustomEvent(MicroFrontendId, {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'error',
              message: `Syntax error found in the provided search text. Please refer to the full help for search syntax, or try:
- Replacing \\ characters with spaces (unless being used to escape another special character)
- Surrounding text containing other special characters with double quotes`,
            },
          },
        })
      );
      break;

    case 'INTERNAL':
      if (/search cancelled for exceeding \d+ seconds/i.test(message)) {
        // search timed out

        // extract "x seconds" from the error message, or "unknown seconds" if for some reason it fails.
        const timeoutString =
          /\d+ seconds/i.exec(message)?.[0] ?? 'unknown seconds.';

        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, {
            detail: {
              type: NotificationType,
              payload: {
                severity: 'error',
                message: `Unable to complete requested search in under ${timeoutString}. To ensure searches complete quickly, please try:
- Only searching "my data"
- Only searching the type of entity you need results for
- Using less wildcard characters in the search term(s)
- Making the search term(s) more specific
- Using the default relevancy based sorting`,
              },
            },
          })
        );
      } else {
        handleICATError(error);
      }
      break;

    default:
      handleICATError(error);
  }
};

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
    AxiosError<LuceneError>,
    SearchResponse,
    SearchResponse,
    [string, DatasearchType, LuceneSearchParams]
  >
): UseInfiniteQueryResult<SearchResponse, AxiosError<LuceneError>> => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  if (facetFilters) {
    // only applies filters if the filter key starts with the data type this is searching
    // e.g. if there are dataset.type.name & investigation.type.name in filter keys,
    // and we are searching investigation, only investigation.type.name will be added to the final filter object.
    luceneParams.filters = Object.entries(facetFilters).reduce<FiltersType>(
      (filters, [filterKey, filterValue]) => {
        if (new RegExp(`^${datasearchType}.*`, 'i').test(filterKey)) {
          const k = filterKey[0].toLocaleLowerCase() + filterKey.substring(1);
          filters[k] = filterValue;
        }
        return filters;
      },
      {}
    );
  }

  return useInfiniteQuery<
    SearchResponse,
    AxiosError<LuceneError>,
    SearchResponse,
    [string, DatasearchType, LuceneSearchParams]
  >(
    ['search', datasearchType, luceneParams],
    () => fetchLuceneData(datasearchType, luceneParams, { icatUrl }),
    {
      onError: (error: AxiosError<LuceneError>) => {
        handleLuceneError(error);
      },
      retry: retryICATErrors,
      getNextPageParam: (lastPage, _) => lastPage.search_after,
      ...(options ?? {}),
    }
  );
};
