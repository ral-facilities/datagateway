import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsSuccessPayload,
  FetchInvestigationsFailureType,
  FetchInvestigationsFailurePayload,
  FetchInvestigationsRequestType,
} from './actions.types';
import { Investigation, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';

export const fetchInvestigationsSuccess = (
  investigations: Investigation[]
): ActionType<FetchInvestigationsSuccessPayload> => ({
  type: FetchInvestigationsSuccessType,
  payload: {
    investigations,
  },
});

export const fetchInvestigationsFailure = (
  error: string
): ActionType<FetchInvestigationsFailurePayload> => ({
  type: FetchInvestigationsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationsRequest = (): Action => ({
  type: FetchInvestigationsRequestType,
});

export const fetchInvestigations = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());

    const filter = getApiFilter(getState);

    let params = {};
    if (Object.keys(filter).length !== 0) {
      params = {
        filter,
      };
    }

    await axios
      .get('/investigations', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};
