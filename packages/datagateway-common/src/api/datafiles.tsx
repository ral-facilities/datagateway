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
  Datafile,
  SortType,
} from '../app.types';
import { StateType } from '../state/app.types';
import type {
  UseQueryResult,
  UseInfiniteQueryResult,
  UseQueryOptions,
} from 'react-query';
import { useQuery, useInfiniteQuery } from 'react-query';
import retryICATErrors from './retryICATErrors';

const fetchDatafiles = (
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
  additionalFilters?: AdditionalFilters
): UseQueryResult<Datafile[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort, page, results } = parseSearchToQuery(location.search);

  return useQuery<
    Datafile[],
    AxiosError,
    Datafile[],
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
      'datafile',
      { sort, filters, page: page ?? 1, results: results ?? 10 },
      additionalFilters,
    ],
    (params) => {
      const { sort, filters, page, results } = params.queryKey[1];
      const startIndex = (page - 1) * results;
      const stopIndex = startIndex + results - 1;
      return fetchDatafiles(apiUrl, { sort, filters }, additionalFilters, {
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

export const useDatafilesInfinite = (
  additionalFilters?: AdditionalFilters
): UseInfiniteQueryResult<Datafile[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters, sort } = parseSearchToQuery(location.search);

  return useInfiniteQuery<
    Datafile[],
    AxiosError,
    Datafile[],
    [string, { sort: SortType; filters: FiltersType }, AdditionalFilters?]
  >(
    ['datafile', { sort, filters }, additionalFilters],
    (params) => {
      const { sort, filters } = params.queryKey[1];
      const offsetParams = params.pageParam ?? { startIndex: 0, stopIndex: 49 };
      return fetchDatafiles(
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

export const useDatafileCount = (
  additionalFilters?: AdditionalFilters,
  storedFilters?: FiltersType,
  currentTab?: string
): UseQueryResult<number, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();

  const filters =
    currentTab === 'datafile' || !storedFilters
      ? parseSearchToQuery(location.search).filters
      : storedFilters;

  return useQuery<
    number,
    AxiosError,
    number,
    [string, string, { filters: FiltersType }, AdditionalFilters?]
  >(
    ['count', 'datafile', { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[2];
      return fetchDatafileCountQuery(apiUrl, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

const fetchDatafileDetails = (
  apiUrl: string,
  datafileId: number,
  additionalFilters?: AdditionalFilters
): Promise<Datafile> => {
  const params = new URLSearchParams();
  params.append('where', JSON.stringify({ id: { eq: datafileId } }));

  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  return axios
    .get(`${apiUrl}/datafiles`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => response.data[0]);
};

export const useDatafileDetails = (
  datafileId: number,
  additionalFilters?: AdditionalFilters,
  options?: UseQueryOptions<
    Datafile,
    AxiosError,
    Datafile,
    [string, number, AdditionalFilters?]
  >
): UseQueryResult<Datafile, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<
    Datafile,
    AxiosError,
    Datafile,
    [string, number, AdditionalFilters?]
  >(
    ['datafileDetails', datafileId, additionalFilters],
    (params) =>
      fetchDatafileDetails(apiUrl, params.queryKey[1], params.queryKey[2]),
    {
      onError: (error) => {
        handleICATError(error);
      },
      retry: retryICATErrors,
      ...options,
    }
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
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
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
  ...queryOptions
}: {
  datafileId: Datafile['id'];
  onDownloadProgress: (progressEvent: ProgressEvent) => void;
} & UseQueryOptions<
  Blob,
  AxiosError,
  Blob,
  ['datafile', 'content', number]
>): UseQueryResult<Blob, AxiosError> => {
  const idsUrl = useSelector<StateType, string>(
    (state) => state.dgcommon.urls.idsUrl
  );

  return useQuery(
    ['datafile', 'content', datafileId],
    () =>
      downloadDatafileToMemory({
        idsUrl,
        datafileId,
        onDownloadProgress,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      ...queryOptions,
    }
  );
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

  console.log('content', content);
  console.log('objectUrl ', objectUrl);

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
