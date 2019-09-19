import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchCountSuccessPayload,
  FetchInvestigationCountSuccessType,
  FetchInvestigationCountFailureType,
  FetchInvestigationCountRequestType,
  RequestPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
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

export const fetchInvestigations = (
  offsetParams?: IndexRange
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    let params = getApiFilter(getState);
    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    await axios
      .get('/investigations', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));
        response.data.forEach((investigation: Investigation) => {
          dispatch(fetchInvestigationDatasetsCount(investigation.ID));
        });
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

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

    await axios
      .get('/investigations/count', {
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
