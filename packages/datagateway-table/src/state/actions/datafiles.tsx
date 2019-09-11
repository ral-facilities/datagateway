import {
  FetchDatafilesSuccessType,
  FetchDatafilesFailureType,
  FetchDatafilesRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
  FetchDatafileCountRequestType,
  DownloadDatafileSuccessType,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchDatafileDetailsSuccessType,
  FetchDatafileDetailsFailureType,
  FetchDatafileDetailsRequestType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { source } from '../middleware/dgtable.middleware';
import * as log from 'loglevel';
import { Datafile } from 'datagateway-common';

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
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafilesRequest());

    let params = getApiFilter(getState);
    params.append('where', JSON.stringify({ DATASET_ID: { eq: datasetId } }));
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datafiles`, {
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
  datasetId: number,
  count: number
): ActionType<FetchDataCountSuccessPayload> => ({
  type: FetchDatafileCountSuccessType,
  payload: {
    id: datasetId,
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
        dispatch(fetchDatafileCountSuccess(datasetId, response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatafileCountFailure(error.message));
      });
  };
};

export const fetchDatafileDetailsSuccess = (
  datafiles: Datafile[]
): ActionType<FetchDataSuccessPayload> => ({
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
  return async dispatch => {
    dispatch(fetchDatafileDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: datasetId } }));
    params.append(
      'include',
      JSON.stringify({ DATAFILEPARAMETER: 'PARAMETERTYPE' })
    );

    await axios
      .get(`/datafiles`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafileDetailsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
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

export const downloadDatafileRequest = (): Action => ({
  type: DownloadDatafileRequestType,
});

export const downloadDatafile = (
  datafileId: number,
  filename: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(downloadDatafileRequest());

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
