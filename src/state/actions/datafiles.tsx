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
} from './actions.types';
import { Datafile, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { source } from '../middleware/dgtable.middleware';
import * as log from 'loglevel';
import { IndexRange } from 'react-virtualized';

export const fetchDatafilesSuccess = (
  datafiles: Datafile[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchDatafilesSuccessType,
  payload: {
    data: datafiles,
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

export const fetchDatafilesRequest = (): Action => ({
  type: FetchDatafilesRequestType,
});

export const fetchDatafiles = (
  datasetId: number,
  offsetParams?: IndexRange
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafilesRequest());

    let filter = getApiFilter(getState);
    filter.where = {
      ...filter.where,
      DATASET_ID: datasetId,
    };
    if (offsetParams) {
      filter.skip = offsetParams.startIndex;
      filter.limit = offsetParams.stopIndex - offsetParams.startIndex + 1;
    }

    const params = {
      filter,
    };

    await axios
      .get('/datafiles', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafilesSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatafilesFailure(error.message));
      });
  };
};

export const fetchDatafileCountSuccess = (
  count: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchDatafileCountSuccessType,
  payload: {
    count,
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

export const fetchDatafileCountRequest = (): Action => ({
  type: FetchDatafileCountRequestType,
});

export const fetchDatafileCount = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafileCountRequest());

    let filter = getApiFilter(getState);
    filter.where = {
      ...filter.where,
      DATASET_ID: datasetId,
    };
    const params = {
      filter,
    };

    await axios
      .get('/datafiles/count', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafileCountSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatafileCountFailure(error.message));
      });
  };
};

export const fetchDatasetDatafilesCountSuccess = (
  datasetId: number,
  count: number
): ActionType<FetchDataCountSuccessPayload> => ({
  type: FetchDatasetDatafilesCountSuccessType,
  payload: {
    id: datasetId,
    count,
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

export const fetchDatasetDatafilesCountRequest = (): Action => ({
  type: FetchDatasetDatafilesCountRequestType,
});

export const fetchDatasetDatafilesCount = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(fetchDatasetDatafilesCountRequest());

    const params = {
      filter: {
        where: {
          DATASET_ID: datasetId,
        },
      },
    };

    await axios
      .get('/datafiles/count', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
        cancelToken: source.token,
      })
      .then(response => {
        dispatch(fetchDatasetDatafilesCountSuccess(datasetId, response.data));
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

export const downloadDatafileRequest = (): Action => ({
  type: DownloadDatafileRequestType,
});

export const downloadDatafile = (
  datafileId: number,
  filename: string
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(downloadDatafileRequest());

    // TODO: get this from some sort of settings file
    const idsUrl = '';

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
