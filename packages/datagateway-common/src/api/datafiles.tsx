import type { UseQueryResult } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios, { AxiosError, AxiosProgressEvent } from 'axios';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { getApiParams, parseSearchToQuery, useEntity } from '.';
import {
  AdditionalFilters,
  Datafile,
  FiltersType,
  SortType,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';
import { INFINITE_SCROLL_BATCH_SIZE } from '../table/table.component';
import { useRetryICATErrors } from './retryICATErrors';

export const fetchDatafiles = (
  apiUrl: string,
  sortAndFilters: {
    sort: SortType;
    filters: FiltersType;
  },
  additionalFilters?: AdditionalFilters,
  offsetParams?: IndexRange
): Promise<Datafile[]> => {
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
    .get(`${apiUrl}/datafiles`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useDatafilesPaginated = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
): UseQueryResult<Datafile[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'datafile',
      {
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        filters,
        page: page ?? 1,
        results: results ?? 10,
      },
      additionalFilters,
      apiUrl,
    ] as const,

    queryFn: (params) => {
      const { page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchDatafiles(apiUrl, { sort, filters }, additionalFilters, {
        startIndex,
        stopIndex,
      });
    },

    meta: { icatError: true },

    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const useDatafilesInfinite = (
  additionalFilters?: AdditionalFilters,
  isMounted?: boolean
) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);
  const retryICATErrors = useRetryICATErrors();

  return useInfiniteQuery({
    queryKey: [
      'datafile',
      { sort: JSON.stringify(sort), filters }, // need to stringify sort as property order is important!
      additionalFilters,
      apiUrl,
    ],
    queryFn: (params) =>
      fetchDatafiles(
        apiUrl,
        { sort, filters },
        additionalFilters,
        params.pageParam
      ),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => ({
      startIndex: lastPageParam.stopIndex + 1,
      stopIndex: lastPageParam.stopIndex + INFINITE_SCROLL_BATCH_SIZE,
    }),
    initialPageParam: { startIndex: 0, stopIndex: 49 },
    meta: { icatError: true },
    retry: retryICATErrors,
    enabled: isMounted ?? true,
  });
};

export const fetchDatafileCountQuery = (
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
    .get(`${apiUrl}/datafiles/count`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data);
};

export const useDatafileCount = (additionalFilters?: AdditionalFilters) => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();

  const filters = parseSearchToQuery(location.search).filters;
  const retryICATErrors = useRetryICATErrors();

  return useQuery({
    queryKey: [
      'count',
      'datafile',
      { filters },
      additionalFilters,
      apiUrl,
    ] as const,
    queryFn: (params) => {
      const { filters } = params.queryKey[2];
      return fetchDatafileCountQuery(apiUrl, filters, additionalFilters);
    },
    meta: { icatError: true },
    retry: retryICATErrors,
  });
};

export const useDatafileDetails = (
  datafileId: number,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  enabled?: boolean
): UseQueryResult<Datafile, AxiosError> => {
  return useEntity(
    'datafile',
    'id',
    datafileId.toString(),
    includeFilter,
    enabled
  );
};

/**
 * Downloads the datafile with the given ID to memory, instead of storage.
 *
 * @param idsUrl: URL of the IDS server
 * @param datafileId The ID of the datafile to be downloaded
 * @param onDownloadProgress An optional callback that is called whenever download progress is made.
 */
const downloadDatafileToMemory = ({
  idsUrl,
  datafileId,
  onDownloadProgress,
}: {
  idsUrl: string;
  datafileId: Datafile['id'];
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
}): Promise<Blob> =>
  axios
    .get(`${idsUrl}/getData`, {
      onDownloadProgress,
      params: {
        datafileIds: `${datafileId}`,
        sessionId: readSciGatewayToken().sessionId,
        compress: false,
      },
    })
    .then((response) => new Blob([response.data]));

/**
 * A React hook that fetches the content of the {@link Datafile} with the given ID
 * as a {@link Blob}.
 *
 * @param datafileId The ID of the {@link Datafile} to be fetched.
 * @param onDownloadProgress A callback that is called with the download progress of the {@link Datafile} content.
 * @param queryOptions Additional {@link useQuery} options. Overrides default options.
 */
export const useDatafileContent = ({
  datafileId,
  onDownloadProgress,
  enabled,
}: {
  datafileId: Datafile['id'];
  onDownloadProgress: (progressEvent: AxiosProgressEvent) => void;
  enabled?: boolean;
}) => {
  const idsUrl = useSelector<StateType, string>(
    (state) => state.dgcommon.urls.idsUrl
  );

  return useQuery({
    // can't track onDownloadProgress in the query key as it's non-serialisable
    // so ignore warning
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['datafile', 'content', datafileId],
    queryFn: () =>
      downloadDatafileToMemory({
        idsUrl,
        datafileId,
        onDownloadProgress,
      }),
    meta: { icatError: true },
    enabled,
  });
};

/**
 * Download the datafile with the given datafile ID. If the content of the datafile is provided, the download will be immediately available.
 *
 * @param idsUrl URL of the IDS server.
 * @param datafileId ID of the datafile to be downloaded
 * @param filename The name of the file that will contain the content of the downloaded datafile.
 * @param content Content of the datafile as a {@link Blob}. Useful when the content is already previously downloaded.
 *                downloadDatafile will use this content to create a download file instead of downloading it again
 *                from IDS.
 */
export const downloadDatafile = (
  idsUrl: string,
  datafileId: number,
  filename: string,
  content?: Blob
): void => {
  const params = {
    sessionId: readSciGatewayToken().sessionId,
    datafileIds: datafileId,
    compress: false,
    outname: filename,
  };

  const link = document.createElement('a');
  const objectUrl = content && window.URL.createObjectURL(content);

  link.href =
    content && objectUrl
      ? objectUrl
      : `${idsUrl}/getData?${Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`;

  if (objectUrl) {
    link.download = filename;
  }

  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (objectUrl) {
    window.URL.revokeObjectURL(objectUrl);
  }
};
