import { sortTable, filterTable, getApiFilter } from '.';
import { SortTableType, FilterTableType } from './actions.types';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';

describe('Actions', () => {
  describe('getApiFilter', () => {
    it('given a empty sort and filters it returns an empty object', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
        },
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual(new URLSearchParams());
    });

    it('given a single sort column in the sort state it returns an order string', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc' },
        },
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));

      expect(filter).toEqual(params);
    });

    it('given multiple sort column in the sort state it returns a list', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
        },
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));

      expect(filter).toEqual(params);
    });

    it('given filter state it returns a filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          filters: {
            column1: 'test',
            column2: { endDate: '2019-09-18' },
          },
        },
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('where', JSON.stringify({ column1: { like: 'test' } }));
      params.append(
        'where',
        JSON.stringify({ column2: { lte: '2019-09-18 23:59:59' } })
      );

      expect(filter).toEqual(params);
    });

    it('given both sort and filter state it returns both an order and where filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
          filters: { column1: 'test', column2: { startDate: '2019-09-17' } },
        },
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));
      params.append('where', JSON.stringify({ column1: { like: 'test' } }));
      params.append(
        'where',
        JSON.stringify({ column2: { gte: '2019-09-17 00:00:00' } })
      );

      expect(filter).toEqual(params);
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
