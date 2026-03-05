import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { format, set } from 'date-fns';
import { useSelector } from 'react-redux';
import {
  FiltersType,
  MicroFrontendId,
  SearchResultSource,
  SortType,
} from '../app.types';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { NotificationType } from '../state/actions/actions.types';
import { StateType } from '../state/app.types';
import { useRetryICATErrors } from './retryICATErrors';

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
  [dimension: string]: {
    [label: string]: number | RangeFacetResponse | undefined;
  };
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
  | (typeof LUCENE_ERROR_CODE)[keyof typeof LUCENE_ERROR_CODE]
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
export const handleLuceneError = (error: AxiosError<LuceneError>): void => {
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
- Using fewer wildcard characters in the search term(s)
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
  const queryParams = new URLSearchParams();
  queryParams.append('sessionId', readSciGatewayToken().sessionId ?? '');
  queryParams.append(
    'query',
    JSON.stringify(urlParamsBuilder(datasearchType, params))
  );
  if (params.sort && Object.keys(params.sort).length > 0)
    queryParams.append('sort', JSON.stringify(params.sort));
  if (params.search_after)
    queryParams.append('search_after', JSON.stringify(params.search_after));
  queryParams.append('minCount', `${params.minCount ? params.minCount : 10}`);
  queryParams.append('maxCount', `${params.maxCount ? params.maxCount : 100}`);
  queryParams.append('restrict', `${!!params.restrict}`);

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
  const queryParams = new URLSearchParams();
  queryParams.append('sessionId', readSciGatewayToken().sessionId ?? '');
  queryParams.append(
    'query',
    JSON.stringify({
      target: datasearchType,
      facets: facets,
      filter: filters,
    })
  );

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
  selectFn: (data: SearchResponse) => TSelectData
) => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  return useQuery({
    queryKey: [
      'facet',
      datasearchType,
      facetRequests,
      facetFilters,
      icatUrl,
    ] as const,

    queryFn: (queryFunctionContext) => {
      return fetchLuceneFacets(
        queryFunctionContext.queryKey[1],
        queryFunctionContext.queryKey[2],
        queryFunctionContext.queryKey[3],
        { icatUrl }
      );
    },
    meta: { icatError: true },
    select: selectFn,
  });
};

export const useLuceneSearchInfinite = <
  TSelectData = InfiniteData<SearchResponse, SearchAfter | undefined>,
>(
  datasearchType: DatasearchType,
  luceneParams: LuceneSearchParams,
  facetFilters: FiltersType,
  {
    enabled,
    select,
  }: {
    enabled?: boolean;
    select?: (
      data: InfiniteData<SearchResponse, SearchAfter | undefined>
    ) => TSelectData;
  }
) => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  const apiLuceneParams = { ...luceneParams };

  if (facetFilters) {
    apiLuceneParams.filters = Object.entries(facetFilters).reduce<FiltersType>(
      (filters, [filterKey, filterValue]) => {
        const k = filterKey[0].toLocaleLowerCase() + filterKey.substring(1);
        filters[k] = filterValue;
        return filters;
      },
      {}
    );
  }
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: ['search', datasearchType, apiLuceneParams, icatUrl],
    queryFn: ({ pageParam }) =>
      fetchLuceneData(
        datasearchType,
        { ...apiLuceneParams, search_after: pageParam },
        { icatUrl }
      ),
    getNextPageParam: (lastPage, _) => lastPage.search_after,
    initialPageParam: undefined as SearchAfter | undefined,
    meta: { luceneError: true },
    retry: retryICATErrors,
    refetchOnWindowFocus: false,
    enabled,
    select,
  });
};
