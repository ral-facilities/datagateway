import { DGTableState } from '../app.types';
import createReducer from './createReducer';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessPayload,
  FetchInvestigationsFailurePayload,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
} from '../actions/actions.types';

export const initialState: DGTableState = {
  sort: null,
  data: [],
  loading: false,
  error: null,
};

export function handleSortTable(
  state: DGTableState,
  payload: SortTablePayload
): DGTableState {
  return {
    ...state,
    sort: {
      column: payload.column,
      order: payload.order,
    },
  };
}

export function handleFetchInvestigationsRequest(
  state: DGTableState
): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchInvestigationsSuccess(
  state: DGTableState,
  payload: FetchInvestigationsSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: payload.investigations,
    error: null,
  };
}

export function handleFetchInvestigationsFailure(
  state: DGTableState,
  payload: FetchInvestigationsFailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: [],
    error: payload.error,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SortTableType]: handleSortTable,
  [FetchInvestigationsRequestType]: handleFetchInvestigationsRequest,
  [FetchInvestigationsSuccessType]: handleFetchInvestigationsSuccess,
  [FetchInvestigationsFailureType]: handleFetchInvestigationsFailure,
});

export default DGTableReducer;
