import {
  ActionType,
  ThunkResult,
  Investigation,
  Filter,
  Order,
} from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessPayload,
  FetchInvestigationsFailurePayload,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FilterTablePayload,
  FilterTableType,
} from './actions.types';
import { Action } from 'redux';
import axios from 'axios';

export const sortTable = (
  column: string,
  order: Order
): ActionType<SortTablePayload> => ({
  type: SortTableType,
  payload: {
    column,
    order,
  },
});

export const filterTable = (
  column: string,
  filter: string
): ActionType<FilterTablePayload> => ({
  type: FilterTableType,
  payload: {
    column,
    filter,
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
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());
    const sort = getState().dgtable.sort;
    const filters = getState().dgtable.filters;

    const order = sort ? `${sort.column} ${sort.order}` : '';

    let filter: {
      order?: string;
      where?: { [column: string]: Filter };
    } = {};

    if (order) {
      filter.order = order;
    }
    if (filters) {
      filter.where = filters;
    }

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
