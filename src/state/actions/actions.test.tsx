import { sortTable, filterTable, getApiFilter } from '.';
import { SortTableType, FilterTableType } from './actions.types';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';

describe('Actions', () => {
  describe('getApiFilter', () => {
    it('given a empty sort anf filters it returns an empty object', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual({});
    });

    it('given a single sort column in the sort state it returns an order string', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc' },
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual({
        order: 'column1 asc',
      });
    });

    it('given multiple sort column in the sort state it returns a list', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual({
        order: ['column1 asc', 'column2 desc'],
      });
    });

    it('given filter state it returns a filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          filters: { column1: 'test', column2: 'test2' },
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual({
        where: {
          column1: 'test',
          column2: 'test2',
        },
      });
    });

    it('given both sort and filter state it returns both an order and where filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
          filters: { column1: 'test', column2: 'test2' },
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual({
        order: ['column1 asc', 'column2 desc'],
        where: {
          column1: 'test',
          column2: 'test2',
        },
      });
    });
  });

  it('given an column and order sortTable returns a SortTableType with SortTablePayload', () => {
    const action = sortTable('test', 'desc');
    expect(action.type).toEqual(SortTableType);
    expect(action.payload).toEqual({ column: 'test', order: 'desc' });
  });

  it('given an column and filter filterTable returns a FilterTableType with FilterTablePayload', () => {
    const action = filterTable('test', 'filter text');
    expect(action.type).toEqual(FilterTableType);
    expect(action.payload).toEqual({ column: 'test', filter: 'filter text' });
  });
});
