import {
  FetchDatafilesSuccessType,
  FetchDatafilesSuccessPayload,
  FetchDatafilesFailureType,
  FetchDatafilesFailurePayload,
  FetchDatafilesRequestType,
  FetchDatafileCountSuccessPayload,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountFailurePayload,
  DownloadDatafileSuccessType,
  DownloadDatafileFailurePayload,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
} from './actions.types';
import { Datafile, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { source } from '../middleware/dgtable.middleware';

export const fetchDatafilesSuccess = (
  datafiles: Datafile[]
): ActionType<FetchDatafilesSuccessPayload> => ({
  type: FetchDatafilesSuccessType,
  payload: {
    datafiles,
  },
});

export const fetchDatafilesFailure = (
  error: string
): ActionType<FetchDatafilesFailurePayload> => ({
  type: FetchDatafilesFailureType,
  payload: {
    error,
  },
});

export const fetchDatafilesRequest = (): Action => ({
  type: FetchDatafilesRequestType,
});

export const fetchDatafiles = (
  datafileId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafilesRequest());

    let filter = getApiFilter(getState);
    filter.where = {
      ...filter.where,
      DATASET_ID: datafileId,
    };

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
        dispatch(fetchDatafilesFailure(error.message));
      });
  };
};

export const fetchDatafileCountSuccess = (
  datasetId: number,
  count: number
): ActionType<FetchDatafileCountSuccessPayload> => ({
  type: FetchDatafileCountSuccessType,
  payload: {
    datasetId,
    count,
  },
});

export const fetchDatafileCountFailure = (
  error: string
): ActionType<FetchDatafileCountFailurePayload> => ({
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
  return async dispatch => {
    dispatch(fetchDatafileCountRequest());

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
        dispatch(fetchDatafileCountSuccess(datasetId, response.data));
      })
      .catch(error => {
        dispatch(fetchDatafileCountFailure(error.message));
      });
  };
};

export const downloadDatafileSuccess = (): Action => ({
  type: DownloadDatafileSuccessType,
});

export const downloadDatafileFailure = (
  error: string
): ActionType<DownloadDatafileFailurePayload> => ({
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
