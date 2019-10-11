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
  FetchCountSuccessPayload,
  FetchDatafileCountSuccessType,
  FetchDatafileCountRequestType,
  FetchDatafileCountFailureType,
  RequestPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { source } from '../middleware/dgtable.middleware';
import * as log from 'loglevel';
import { Datafile } from 'datagateway-common';
import { IndexRange } from 'react-virtualized';

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

export const fetchDatafiles = (
  datasetId: number,
  offsetParams?: IndexRange
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatafilesRequest(timestamp));

    let params = getApiFilter(getState);
    params.append('where', JSON.stringify({ DATASET_ID: { eq: datasetId } }));
    const { apiUrl } = getState().dgtable.urls;

    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    await axios
      .get(`${apiUrl}/datafiles`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafilesSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
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
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatafileCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.append('where', JSON.stringify({ DATASET_ID: { eq: datasetId } }));
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datafiles/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafileCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
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
        DATASET_ID: { eq: datasetId },
      },
    };
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datafiles/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
        cancelToken: source.token,
      })
      .then(response => {
        dispatch(
          fetchDatasetDatafilesCountSuccess(datasetId, response.data, timestamp)
        );
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetDatafilesCountFailure(error.message));
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

    const { idsUrl } = getState().dgtable.urls;

    // TODO: get ICAT session id properly when auth is sorted
    const params = {
      sessionId: window.localStorage.getItem('icat:token'),
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
