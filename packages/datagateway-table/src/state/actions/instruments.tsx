import {
  FetchInstrumentsSuccessType,
  FetchInstrumentsFailureType,
  FetchInstrumentsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchInstrumentDetailsSuccessType,
  FetchInstrumentDetailsFailureType,
  FetchInstrumentDetailsRequestType,
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
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/instruments`, {
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

export const fetchInstrumentDetailsSuccess = (
  instruments: Instrument[]
): ActionType<FetchDataSuccessPayload> => ({
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
  return async dispatch => {
    dispatch(fetchInstrumentDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: instrumentId } }));
    params.append('include', JSON.stringify({ INSTRUMENTSCIENTIST: 'USER_' }));

    await axios
      .get(`/instruments`, {
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
