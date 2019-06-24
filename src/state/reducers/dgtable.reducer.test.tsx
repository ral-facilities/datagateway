import DGTableReducer, { initialState } from './dgtable.reducer';
import { DGTableState } from '../app.types';
import { sortTable } from '../actions/actions';

describe('dgtable reducer', () => {
  let state: DGTableState;

  beforeEach(() => {
    state = initialState;
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGTableReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set the sort state when given a SortTable action', () => {
    expect(state.sort).toBeNull();

    let updatedState = DGTableReducer(state, sortTable('test', 'ASC'));
    expect(updatedState.sort).toEqual({ column: 'test', order: 'ASC' });
  });
});
