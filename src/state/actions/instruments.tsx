import {
  FetchInstrumentsSuccessType,
  FetchInstrumentsSuccessPayload,
  FetchInstrumentsFailureType,
  FetchInstrumentsFailurePayload,
  FetchInstrumentsRequestType,
} from './actions.types';
import { Instrument, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';

export const fetchInstrumentsSuccess = (
  instruments: Instrument[]
): ActionType<FetchInstrumentsSuccessPayload> => ({
  type: FetchInstrumentsSuccessType,
  payload: {
    instruments,
  },
});

export const fetchInstrumentsFailure = (
  error: string
): ActionType<FetchInstrumentsFailurePayload> => ({
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

    const filter = getApiFilter(getState);

    let params = {};
    if (Object.keys(filter).length !== 0) {
      params = {
        filter,
      };
    }

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
        dispatch(fetchInstrumentsFailure(error.message));
      });
  };
};
