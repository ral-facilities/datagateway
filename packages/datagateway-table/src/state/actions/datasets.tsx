import {
  FetchDatasetsSuccessType,
  FetchDatasetsFailureType,
  FetchDatasetsRequestType,
  FetchDatasetCountRequestType,
  FetchDatasetCountFailureType,
  FetchDatasetCountSuccessType,
  DownloadDatasetSuccessType,
  DownloadDatasetFailureType,
  DownloadDatasetRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchDatasetDetailsSuccessType,
  FetchDatasetDetailsFailureType,
  FetchDatasetDetailsRequestType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { source } from '../middleware/dgtable.middleware';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchDatafileCount } from './datafiles';
import * as log from 'loglevel';
import { Dataset } from 'datagateway-common';

export const fetchDatasetsSuccess = (
  datasets: Dataset[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchDatasetsSuccessType,
  payload: {
    data: datasets,
  },
});

export const fetchDatasetsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatasetsFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetsRequest = (): Action => ({
  type: FetchDatasetsRequestType,
});

export const fetchDatasets = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatasetsRequest());

    let params = getApiFilter(getState);
    params.append(
      'where',
      JSON.stringify({ INVESTIGATION_ID: { eq: investigationId } })
    );
    const { datasetGetCount } = getState().dgtable.features;
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datasets`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatasetsSuccess(response.data));
        if (datasetGetCount) {
          response.data.forEach((dataset: Dataset) => {
            dispatch(fetchDatafileCount(dataset.ID));
          });
        }
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetsFailure(error.message));
      });
  };
};

export const downloadDatasetSuccess = (): Action => ({
  type: DownloadDatasetSuccessType,
});

export const downloadDatasetFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: DownloadDatasetFailureType,
  payload: {
    error,
  },
});

export const downloadDatasetRequest = (): Action => ({
  type: DownloadDatasetRequestType,
});

export const downloadDataset = (
  datasetId: number,
  datasetName: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(downloadDatasetRequest());

    const { idsUrl } = getState().dgtable.urls;

    // TODO: get ICAT session id properly when auth is sorted
    const params = {
      sessionId: window.localStorage.getItem('icat:token'),
      datasetIds: datasetId,
      compress: false,
      zip: true,
      outname: datasetName,
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

export const fetchDatasetCountSuccess = (
  investigationId: number,
  count: number
): ActionType<FetchDataCountSuccessPayload> => ({
  type: FetchDatasetCountSuccessType,
  payload: {
    id: investigationId,
    count,
  },
});

export const fetchDatasetCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatasetCountFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetCountRequest = (): Action => ({
  type: FetchDatasetCountRequestType,
});

export const fetchDatasetCount = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatasetCountRequest());

    const params = {
      where: {
        INVESTIGATION_ID: { eq: investigationId },
      },
    };
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datasets/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
        cancelToken: source.token,
      })
      .then(response => {
        dispatch(fetchDatasetCountSuccess(investigationId, response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetCountFailure(error.message));
      });
  };
};

export const fetchDatasetDetailsSuccess = (
  datasets: Dataset[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchDatasetDetailsSuccessType,
  payload: {
    data: datasets,
  },
});

export const fetchDatasetDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatasetDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetDetailsRequest = (): Action => ({
  type: FetchDatasetDetailsRequestType,
});

export const fetchDatasetDetails = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(fetchDatasetDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: datasetId } }));
    params.append('include', JSON.stringify('DATASETTYPE'));

    await axios
      .get(`/datasets`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatasetDetailsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetDetailsFailure(error.message));
      });
  };
};
