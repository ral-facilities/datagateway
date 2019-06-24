import { DGTableState } from '../app.types';
import createReducer from './createReducer';
import { SortTablePayload, SortTableType } from '../actions/actions.types';

export const initialState: DGTableState = {
  sort: null,
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

const DGTableReducer = createReducer(initialState, {
  [SortTableType]: handleSortTable,
});

export default DGTableReducer;
