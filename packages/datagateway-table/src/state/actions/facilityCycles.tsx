import {
  FetchFacilityCyclesSuccessType,
  FetchFacilityCyclesFailureType,
  FetchFacilityCyclesRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchCountSuccessPayload,
  FetchFacilityCycleCountSuccessType,
  FetchFacilityCycleCountFailureType,
  FetchFacilityCycleCountRequestType,
  RequestPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import axios from 'axios';
import { getApiFilter } from '.';
import * as log from 'loglevel';
import { FacilityCycle } from 'datagateway-common';

export const fetchFacilityCyclesSuccess = (
  facilityCycles: FacilityCycle[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchFacilityCyclesSuccessType,
  payload: {
    data: facilityCycles,
    timestamp,
  },
});

export const fetchFacilityCyclesFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchFacilityCyclesFailureType,
  payload: {
    error,
  },
});

export const fetchFacilityCyclesRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchFacilityCyclesRequestType,
  payload: {
    timestamp,
  },
});

export const fetchFacilityCycles = (
  instrumentId: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchFacilityCyclesRequest(timestamp));

    let params = getApiFilter(getState);
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/instruments/${instrumentId}/facilitycycles`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchFacilityCyclesSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchFacilityCyclesFailure(error.message));
      });
  };
};

export const fetchFacilityCycleCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchFacilityCycleCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchFacilityCycleCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchFacilityCycleCountFailureType,
  payload: {
    error,
  },
});

export const fetchFacilityCycleCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchFacilityCycleCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchFacilityCycleCount = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchFacilityCycleCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.delete('order');
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/facilitycycles/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchFacilityCycleCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchFacilityCycleCountFailure(error.message));
      });
  };
};
