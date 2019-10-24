import {
  FetchDatasetsSuccessType,
  FetchDatasetsFailureType,
  FetchDatasetsRequestType,
  FetchInvestigationDatasetsCountRequestType,
  FetchInvestigationDatasetsCountFailureType,
  FetchInvestigationDatasetsCountSuccessType,
  DownloadDatasetSuccessType,
  DownloadDatasetFailureType,
  DownloadDatasetRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchDatasetDetailsSuccessType,
  FetchDatasetDetailsFailureType,
  FetchDatasetDetailsRequestType,
  FetchCountSuccessPayload,
  FetchDatasetCountSuccessType,
  FetchDatasetCountFailureType,
  FetchDatasetCountRequestType,
  RequestPayload,
  FetchDetailsSuccessPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { source } from '../middleware/dgtable.middleware';
import { Action } from 'redux';
import { batch } from 'react-redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchDatasetDatafilesCount } from './datafiles';
import * as log from 'loglevel';
import { IndexRange } from 'react-virtualized';
import { Dataset } from 'datagateway-common';

export const fetchDatasetsSuccess = (
  datasets: Dataset[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchDatasetsSuccessType,
  payload: {
    data: datasets,
    timestamp,
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

export const fetchDatasetsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchDatasetsRequestType,
  payload: {
    timestamp,
  },
});

interface FetchDatasetsParams {
  getDatafileCount?: boolean;
  getSize?: boolean;
}

export const fetchDatasets = ({
  investigationId,
  offsetParams,
  optionalParams,
}: {
  investigationId: number;
  offsetParams?: IndexRange;
  optionalParams?: FetchDatasetsParams;
}): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatasetsRequest(timestamp));

    let params = getApiFilter(getState);
    params.append(
      'where',
      JSON.stringify({ INVESTIGATION_ID: { eq: investigationId } })
    );
    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datasets`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatasetsSuccess(response.data, timestamp));
        if (optionalParams && optionalParams.getDatafileCount) {
          batch(() => {
            response.data.forEach((dataset: Dataset) => {
              dispatch(fetchDatasetDatafilesCount(dataset.ID));
            });
          });
        }
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetsFailure(error.message));
      });
  };
};

export const fetchDatasetCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchDatasetCountSuccessType,
  payload: {
    count,
    timestamp,
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

export const fetchDatasetCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchDatasetCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchDatasetCount = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatasetCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.delete('order');
    params.append(
      'where',
      JSON.stringify({ INVESTIGATION_ID: { eq: investigationId } })
    );
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/datasets/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatasetCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDatasetCountFailure(error.message));
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

export const downloadDatasetRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: DownloadDatasetRequestType,
  payload: {
    timestamp,
  },
});

export const downloadDataset = (
  datasetId: number,
  datasetName: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(downloadDatasetRequest(timestamp));

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

export const fetchInvestigationDatasetsCountSuccess = (
  investigationId: number,
  count: number,
  timestamp: number
): ActionType<FetchDataCountSuccessPayload> => ({
  type: FetchInvestigationDatasetsCountSuccessType,
  payload: {
    id: investigationId,
    count,
    timestamp,
  },
});

export const fetchInvestigationDatasetsCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationDatasetsCountFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationDatasetsCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationDatasetsCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationDatasetsCount = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationDatasetsCountRequest(timestamp));

    const params = {
      where: {
        INVESTIGATION_ID: { eq: investigationId },
      },
    };
    const { apiUrl } = getState().dgtable.urls;

    const currentCache = getState().dgtable.investigationCache[investigationId];

    // Check to see if a cached value exists already in the cache's child entity count.
    if (currentCache && currentCache.childEntityCount) {
      // Dispatch success with the cached dataset count.
      dispatch(
        fetchInvestigationDatasetsCountSuccess(
          investigationId,
          currentCache.childEntityCount,
          timestamp
        )
      );
    } else {
      await axios
        .get(`${apiUrl}/datasets/count`, {
          params,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem(
              'daaas:token'
            )}`,
          },
          cancelToken: source.token,
        })
        .then(response => {
          dispatch(
            fetchInvestigationDatasetsCountSuccess(
              investigationId,
              response.data,
              timestamp
            )
          );
        })
        .catch(error => {
          log.error(error.message);
          dispatch(fetchInvestigationDatasetsCountFailure(error.message));
        });
    }
  };
};

export const fetchDatasetDetailsSuccess = (
  datasets: Dataset[]
): ActionType<FetchDetailsSuccessPayload> => ({
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
