import {
  FetchInstrumentsSuccessType,
  FetchInstrumentsFailureType,
  FetchInstrumentsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
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
