import DGTableReducer, { initialState } from './dgtable.reducer';
import { DGTableState, Investigation } from '../app.types';
import {
  sortTable,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
} from '../actions/actions';

describe('dgtable reducer', () => {
  let state: DGTableState;

  beforeEach(() => {
    state = { ...initialState };
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

  describe('FetchInvestigations actions', () => {
    it('should set the loading state when given a FetchInvestigationsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchInvestigationsRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: '1',
          TITLE: 'Test 1',
          VISIT_ID: 1,
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: new Date('2019-06-10'),
          ENDDATE: new Date('2019-06-11'),
        },
        {
          ID: '2',
          TITLE: 'Test 2',
          VISIT_ID: 2,
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: new Date('2019-06-10'),
          ENDDATE: new Date('2019-06-12'),
        },
      ];

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsSuccess(mockData)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });
});
