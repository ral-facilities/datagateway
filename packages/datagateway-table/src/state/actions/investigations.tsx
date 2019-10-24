import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchInvestigationDetailsRequestType,
  FetchCountSuccessPayload,
  FetchInvestigationCountSuccessType,
  FetchInvestigationCountFailureType,
  FetchInvestigationCountRequestType,
  RequestPayload,
  FetchDetailsSuccessPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import { batch } from 'react-redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchInvestigationDatasetsCount } from './datasets';
import * as log from 'loglevel';
import { Investigation } from 'datagateway-common';
import { IndexRange } from 'react-virtualized';

export const fetchInvestigationsSuccess = (
  investigations: Investigation[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInvestigationsSuccessType,
  payload: {
    data: investigations,
    timestamp,
  },
});

export const fetchInvestigationsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationsRequestType,
  payload: {
    timestamp,
  },
});

interface FetchInvestigationsParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  getDatasetCount?: boolean;
  getSize?: boolean;
  offsetParams?: IndexRange;
}

export const fetchInvestigations = (
  optionalParams?: FetchInvestigationsParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    let params = getApiFilter(getState);
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
    const { apiUrl } = getState().dgtable.urls;

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach(filter => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));
        if (optionalParams && optionalParams.getDatasetCount) {
          batch(() => {
            response.data.forEach((investigation: Investigation) => {
              dispatch(fetchInvestigationDatasetsCount(investigation.ID));
            });
          });
        }
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

export const fetchInvestigationDetailsSuccess = (
  investigations: Investigation[]
): ActionType<FetchDetailsSuccessPayload> => ({
  type: FetchInvestigationDetailsSuccessType,
  payload: {
    data: investigations,
  },
});

export const fetchInvestigationDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchInvestigationCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchInvestigationCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationCountFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationDetailsRequest = (): Action => ({
  type: FetchInvestigationDetailsRequestType,
});

export const fetchInvestigationDetails = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(fetchInvestigationDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: investigationId } }));
    params.append(
      'include',
      JSON.stringify([{ INVESTIGATIONUSER: 'USER_' }, 'SAMPLE', 'PUBLICATION'])
    );

    await axios
      .get(`/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationDetailsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationDetailsFailure(error.message));
      });
  };
};

export const fetchInvestigationCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationCount = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.delete('order');
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/investigations/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationCountFailure(error.message));
      });
  };
};
