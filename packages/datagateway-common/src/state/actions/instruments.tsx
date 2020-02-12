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
import { Instrument } from '../../app.types';
import { Action } from 'redux';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

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

export const fetchInstruments = (
  offsetParams?: IndexRange
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInstrumentsRequest(timestamp));

    let params = getApiFilter(getState);
    const { apiUrl } = getState().dgcommon.urls;

    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    await axios
      .get(`${apiUrl}/instruments`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentsSuccess(response.data, timestamp));
      })
      .catch(error => {
        handleICATError(error);
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
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/instruments/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        handleICATError(error);
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

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/instruments`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInstrumentDetailsSuccess(response.data));
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInstrumentDetailsFailure(error.message));
      });
  };
};
