import { ActionType, ThunkResult, Investigation, Filter } from '../app.types';
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
  order: 'asc' | 'desc'
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

export const fetchInvestigations = (
  filter?: Filter
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(fetchInvestigationsRequest());
    await axios
      .get('/investigations', {
        params: {
          filter,
        },
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

export const sortInvestigationsTable = (
  column: string,
  order: 'asc' | 'desc'
): ThunkResult<void> => {
  return dispatch => {
    dispatch(sortTable(column, order));
    dispatch(fetchInvestigations({ order: `${column} ${order}` }));
  };
};
