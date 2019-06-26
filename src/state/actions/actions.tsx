import { ActionType, ThunkResult, Investigation } from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessPayload,
  FetchInvestigationsFailurePayload,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
} from './actions.types';
import { Action } from 'redux';
import axios from 'axios';

export const sortTable = (
  column: string,
  order: 'ASC' | 'DESC'
): ActionType<SortTablePayload> => ({
  type: SortTableType,
  payload: {
    column,
    order,
  },
});

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
  return async dispatch => {
    dispatch(fetchInvestigationsRequest());
    await axios
      .get('/investigations', {
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
