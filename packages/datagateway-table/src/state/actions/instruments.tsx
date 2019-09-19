import {
  FetchInstrumentsSuccessType,
  FetchInstrumentsFailureType,
  FetchInstrumentsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchCountSuccessPayload,
  FetchInstrumentCountSuccessType,
  FetchInstrumentCountFailureType,
  FetchInstrumentCountRequestType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import * as log from 'loglevel';
import { Instrument } from 'datagateway-common';

export const fetchInstrumentsSuccess = (
  instruments: Instrument[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInstrumentsSuccessType,
  payload: {
    data: instruments,
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

export const fetchInstrumentsRequest = (): Action => ({
  type: FetchInstrumentsRequestType,
});

export const fetchInstruments = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInstrumentsRequest());

    let params = getApiFilter(getState);

    await axios
      .get('/instruments', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInstrumentsFailure(error.message));
      });
  };
};

export const fetchInstrumentCountSuccess = (
  count: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchInstrumentCountSuccessType,
  payload: {
    count,
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

export const fetchInstrumentCountRequest = (): Action => ({
  type: FetchInstrumentCountRequestType,
});

export const fetchInstrumentCount = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInstrumentCountRequest());

    let params = getApiFilter(getState);

    await axios
      .get('/instruments/count', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentCountSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInstrumentCountFailure(error.message));
      });
  };
};
