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
import { FacilityCycle } from '../../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

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
  instrumentId: number,
  offsetParams?: IndexRange
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchFacilityCyclesRequest(timestamp));

    const params = getApiFilter(getState);
    const { apiUrl } = getState().dgcommon.urls;

    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    await axios
      .get(`${apiUrl}/instruments/${instrumentId}/facilitycycles`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchFacilityCyclesSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
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

export const fetchFacilityCycleCount = (
  instrumentId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchFacilityCycleCountRequest(timestamp));

    const params = getApiFilter(getState);
    params.delete('order');
    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/instruments/${instrumentId}/facilitycycles/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchFacilityCycleCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchFacilityCycleCountFailure(error.message));
      });
  };
};
