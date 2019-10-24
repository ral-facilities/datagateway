import {
  FetchInstrumentsSuccessType,
  FetchInstrumentsFailureType,
  FetchInstrumentsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchInstrumentDetailsSuccessType,
  FetchInstrumentDetailsFailureType,
  FetchInstrumentDetailsRequestType,
  FetchCountSuccessPayload,
  FetchInstrumentCountSuccessType,
  FetchInstrumentCountFailureType,
  FetchInstrumentCountRequestType,
  RequestPayload,
  FetchDetailsSuccessPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import axios from 'axios';
import { getApiFilter } from '.';
import * as log from 'loglevel';
import { Instrument } from 'datagateway-common';
import { Action } from 'redux';

export const fetchInstrumentsSuccess = (
  instruments: Instrument[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInstrumentsSuccessType,
  payload: {
    data: instruments,
    timestamp,
  },
});

export const fetchInstrumentsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInstrumentsFailureType,
  payload: {
    error,
  },
});

export const fetchInstrumentsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInstrumentsRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInstruments = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInstrumentsRequest(timestamp));

    let params = getApiFilter(getState);
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/instruments`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentsSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInstrumentsFailure(error.message));
      });
  };
};

export const fetchInstrumentCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchInstrumentCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchInstrumentCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInstrumentCountFailureType,
  payload: {
    error,
  },
});

export const fetchInstrumentCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInstrumentCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInstrumentCount = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInstrumentCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.delete('order');
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/instruments/count`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInstrumentCountFailure(error.message));
      });
  };
};

export const fetchInstrumentDetailsSuccess = (
  instruments: Instrument[]
): ActionType<FetchDetailsSuccessPayload> => ({
  type: FetchInstrumentDetailsSuccessType,
  payload: {
    data: instruments,
  },
});

export const fetchInstrumentDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInstrumentDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchInstrumentDetailsRequest = (): Action => ({
  type: FetchInstrumentDetailsRequestType,
});

export const fetchInstrumentDetails = (
  instrumentId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInstrumentDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: instrumentId } }));
    params.append('include', JSON.stringify({ INSTRUMENTSCIENTIST: 'USER_' }));

    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/instruments`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentDetailsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInstrumentDetailsFailure(error.message));
      });
  };
};
