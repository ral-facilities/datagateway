import {
  ActionType,
  ThunkResult,
  Investigation,
  Filter,
  ApiFilter,
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

const mergeFilters = (
  currSort?: { column: string; order: Order },
  currFilters?: { [column: string]: Filter },
  newFilter?: ApiFilter
): ApiFilter => {
  const currOrder = currSort ? `${currSort.column} ${currSort.order}` : '';
  console.log(currOrder);

  let filter: {
    order?: string;
    where?: { [column: string]: Filter };
  } = {};

  if (newFilter && newFilter.order) {
    filter.order = newFilter.order;
  } else if (currOrder) {
    filter.order = currOrder;
  }

  if (newFilter && newFilter.where) {
    filter.where = {
      ...currFilters,
      ...newFilter.where,
    };
  } else if (currFilters) {
    filter.where = currFilters;
  }

  return filter;
};

export const fetchInvestigations = (
  newApiFilter?: ApiFilter
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());
    const currSort = getState().dgtable.sort;
    const currFilters = getState().dgtable.filters;

    const filter = mergeFilters(currSort, currFilters, newApiFilter);

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

export const sortInvestigationsTable = (
  column: string,
  order: Order
): ThunkResult<void> => {
  return dispatch => {
    dispatch(sortTable(column, order));
    dispatch(fetchInvestigations({ order: `${column} ${order}` }));
  };
};

export const filterInvestigationsTable = (
  column: string,
  filter: Filter
): ThunkResult<void> => {
  return dispatch => {
    dispatch(filterTable(column, filter));
    dispatch(fetchInvestigations({ where: { [column]: filter } }));
  };
};
