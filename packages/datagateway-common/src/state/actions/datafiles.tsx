import {
  FetchDatafilesSuccessType,
  FetchDatafilesFailureType,
  FetchDatafilesRequestType,
  FetchDatasetDatafilesCountSuccessType,
  FetchDatasetDatafilesCountFailureType,
  FetchDatasetDatafilesCountRequestType,
  DownloadDatafileSuccessType,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchDatafileDetailsSuccessType,
  FetchDatafileDetailsFailureType,
  FetchDatafileDetailsRequestType,
  FetchCountSuccessPayload,
  FetchDatafileCountSuccessType,
  FetchDatafileCountRequestType,
  FetchDatafileCountFailureType,
  RequestPayload,
  FetchDetailsSuccessPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { source } from '../middleware/dgcommon.middleware';
import { Datafile } from '../../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

export const fetchDatafilesSuccess = (
  datafiles: Datafile[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchDatafilesSuccessType,
  payload: {
    data: datafiles,
    timestamp,
  },
});

export const fetchDatafilesFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatafilesFailureType,
  payload: {
    error,
  },
});

export const fetchDatafilesRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchDatafilesRequestType,
  payload: {
    timestamp,
  },
});

interface FetchDatafilesParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  offsetParams?: IndexRange;
}

export const fetchDatafiles = (
  optionalParams: FetchDatafilesParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatafilesRequest(timestamp));

    const params = getApiFilter(getState);

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    const { apiUrl } = getState().dgcommon.urls;

    if (optionalParams && optionalParams.offsetParams) {
      params.append(
        'skip',
        JSON.stringify(optionalParams.offsetParams.startIndex)
      );
      params.append(
        'limit',
        JSON.stringify(
          optionalParams.offsetParams.stopIndex -
            optionalParams.offsetParams.startIndex +
            1
        )
      );
    }

    await axios
      .get(`${apiUrl}/datafiles`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatafilesSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchDatafilesFailure(error.message));
      });
  };
};

export const fetchDatafileCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchDatafileCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchDatafileCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatafileCountFailureType,
  payload: {
    error,
  },
});

export const fetchDatafileCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchDatafileCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchDatafileCount = (
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatafileCountRequest(timestamp));

    const params = getApiFilter(getState);
    if (additionalFilters) {
      additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }
    params.delete('order');
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/datafiles/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatafileCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchDatafileCountFailure(error.message));
      });
  };
};

export const fetchDatasetDatafilesCountSuccess = (
  datasetId: number,
  count: number,
  timestamp: number
): ActionType<FetchDataCountSuccessPayload> => ({
  type: FetchDatasetDatafilesCountSuccessType,
  payload: {
    id: datasetId,
    count,
    timestamp,
  },
});

export const fetchDatasetDatafilesCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatasetDatafilesCountFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetDatafilesCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchDatasetDatafilesCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchDatasetDatafilesCount = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatasetDatafilesCountRequest(timestamp));

    const params = {
      where: {
        dataset: { eq: datasetId },
      },
    };
    const { apiUrl } = getState().dgcommon.urls;

    const currentCache = getState().dgcommon.datasetCache[datasetId];

    // Check if the cached value exists already in the cache's child entity count.
    if (currentCache && currentCache.childEntityCount) {
      // Dispatch success with the cached datafile count.
      dispatch(
        fetchDatasetDatafilesCountSuccess(
          datasetId,
          currentCache.childEntityCount,
          timestamp
        )
      );
    } else {
      await axios
        .get(`${apiUrl}/datafiles/count`, {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
          cancelToken: source.token,
        })
        .then((response) => {
          dispatch(
            fetchDatasetDatafilesCountSuccess(
              datasetId,
              response.data,
              timestamp
            )
          );
        })
        .catch((error) => {
          handleICATError(error, false);
          dispatch(fetchDatasetDatafilesCountFailure(error.message));
        });
    }
  };
};

export const fetchDatafileDetailsSuccess = (
  datafiles: Datafile[]
): ActionType<FetchDetailsSuccessPayload> => ({
  type: FetchDatafileDetailsSuccessType,
  payload: {
    data: datafiles,
  },
});

export const fetchDatafileDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatafileDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchDatafileDetailsRequest = (): Action => ({
  type: FetchDatafileDetailsRequestType,
});

export const fetchDatafileDetails = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafileDetailsRequest());

    const params = new URLSearchParams();

    params.append('where', JSON.stringify({ id: { eq: datasetId } }));
    params.append('include', JSON.stringify({ datafileParameters: 'type' }));
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/datafiles`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatafileDetailsSuccess(response.data));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchDatafileDetailsFailure(error.message));
      });
  };
};

export const downloadDatafileSuccess = (): Action => ({
  type: DownloadDatafileSuccessType,
});

export const downloadDatafileFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: DownloadDatafileFailureType,
  payload: {
    error,
  },
});

export const downloadDatafileRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: DownloadDatafileRequestType,
  payload: {
    timestamp,
  },
});

export const downloadDatafile = (
  datafileId: number,
  filename: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(downloadDatafileRequest(timestamp));

    const { idsUrl } = getState().dgcommon.urls;

    const params = {
      sessionId: readSciGatewayToken().sessionId,
      datafileIds: datafileId,
      compress: false,
      outname: filename,
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
};
