import {
  FetchFacilityCyclesSuccessType,
  FetchFacilityCyclesFailureType,
  FetchFacilityCyclesRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
} from './actions.types';
import { FacilityCycle, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import * as log from 'loglevel';

export const fetchFacilityCyclesSuccess = (
  facilityCycles: FacilityCycle[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchFacilityCyclesSuccessType,
  payload: {
    data: facilityCycles,
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

export const fetchFacilityCyclesRequest = (): Action => ({
  type: FetchFacilityCyclesRequestType,
});

// TODO: make this fetch based on instrumentId
export const fetchFacilityCycles = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchFacilityCyclesRequest());

    const filter = getApiFilter(getState);
    const { apiUrl } = getState().dgtable.urls;

    let params = {};
    if (Object.keys(filter).length !== 0) {
      params = {
        filter,
      };
    }

    await axios
      .get(`${apiUrl}/facilitycycles`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchFacilityCyclesSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchFacilityCyclesFailure(error.message));
      });
  };
};
