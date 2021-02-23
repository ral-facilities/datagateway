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
  FetchSizeSuccessPayload,
  FetchDatasetSizeRequestType,
  FetchDatasetSizeSuccessType,
  FetchDatasetSizeFailureType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { source } from '../middleware/dgcommon.middleware';
import { Action } from 'redux';
import { batch } from 'react-redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchDatasetDatafilesCount } from './datafiles';
import { IndexRange } from 'react-virtualized';
import { Dataset } from '../../app.types';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

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

export const fetchDatasetSizeRequest = (): Action => ({
  type: FetchDatasetSizeRequestType,
});

export const fetchDatasetSizeSuccess = (
  datasetId: number,
  size: number
): ActionType<FetchSizeSuccessPayload> => ({
  type: FetchDatasetSizeSuccessType,
  payload: {
    id: datasetId,
    size,
  },
});

export const fetchDatasetSizeFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDatasetSizeFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetSize = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatasetSizeRequest());

    // Make use of the facility name and download API url for the request.
    const { facilityName } = getState().dgcommon;
    const { downloadApiUrl } = getState().dgcommon.urls;
    const currentCache = getState().dgcommon.datasetCache[datasetId];

    // Check for cached dataset size in datasetCache.
    if (currentCache && currentCache.childEntitySize) {
      // Dispatch success with cache dataset size.
      dispatch(
        fetchDatasetSizeSuccess(datasetId, currentCache.childEntitySize)
      );
    } else {
      await axios
        .get(`${downloadApiUrl}/user/getSize`, {
          params: {
            sessionId: readSciGatewayToken().sessionId,
            facilityName: facilityName,
            entityType: 'dataset',
            entityId: datasetId,
          },
        })
        .then((response) => {
          dispatch(fetchDatasetSizeSuccess(datasetId, response.data));
        })
        .catch((error) => {
          handleICATError(error, false);
          dispatch(fetchDatasetSizeFailure(error.message));
        });
    }
  };
};

interface FetchDatasetsParams {
  getDatafileCount?: boolean;
  getSize?: boolean;
  offsetParams?: IndexRange;
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
}

export const fetchDatasets = (
  optionalParams?: FetchDatasetsParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatasetsRequest(timestamp));

    const params = getApiFilter(getState);

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

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
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/datasets`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatasetsSuccess(response.data, timestamp));
        if (optionalParams) {
          if (optionalParams.getDatafileCount) {
            batch(() => {
              response.data.forEach((dataset: Dataset) => {
                dispatch(fetchDatasetDatafilesCount(dataset.id));
              });
            });
          }

          // This is mainly for the ISIS dataset table, but will
          // fetch size when the optional parameter getSize has been set.
          if (optionalParams.getSize) {
            batch(() => {
              response.data.forEach((dataset: Dataset) => {
                dispatch(fetchDatasetSize(dataset.id));
              });
            });
          }
        }
      })
      .catch((error) => {
        handleICATError(error);
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
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchDatasetCountRequest(timestamp));

    const params = getApiFilter(getState);

    if (additionalFilters) {
      additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    params.delete('order');
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/datasets/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatasetCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
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

    const { idsUrl } = getState().dgcommon.urls;

    const params = {
      sessionId: readSciGatewayToken().sessionId,
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
        'investigation.id': { eq: investigationId },
      },
      include: 'investigation',
    };

    const { apiUrl } = getState().dgcommon.urls;

    const currentCache = getState().dgcommon.investigationCache[
      investigationId
    ];

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
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
          cancelToken: source.token,
        })
        .then((response) => {
          dispatch(
            fetchInvestigationDatasetsCountSuccess(
              investigationId,
              response.data,
              timestamp
            )
          );
        })
        .catch((error) => {
          handleICATError(error, false);
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
  return async (dispatch, getState) => {
    dispatch(fetchDatasetDetailsRequest());

    const params = new URLSearchParams();

    params.append('where', JSON.stringify({ id: { eq: datasetId } }));
    params.append('include', JSON.stringify('type'));

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/datasets`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchDatasetDetailsSuccess(response.data));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchDatasetDetailsFailure(error.message));
      });
  };
};
