import {
  sortTable,
  filterTable,
  getApiFilter,
  loadUrls,
  loadFacilityName,
  clearTable,
  saveView,
  updateSaveView,
  pushPageSort,
  pushPageFilter,
  pushPageResults,
  updateResults,
  pushPageNum,
  updatePage,
  pushPageSearch,
  updateSearch,
  pushPageView,
  updateView,
  loadURLQuery,
  updateQueryParams,
  nestedValue,
  pushQuery,
  clearData,
} from '.';
import {
  SortTableType,
  FilterTableType,
  ClearTableType,
  ConfigureURLsType,
  ConfigureFacilityNameType,
} from './actions.types';
import { QueryParams, StateType } from '../app.types';
import { push, RouterState } from 'connected-react-router';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import {
  initialState as dGCommonInitialState,
  initialState,
} from '../reducers/dgcommon.reducer';
import { Entity, FiltersType, SortType } from '../../app.types';

jest.mock('loglevel');

describe('Actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
    resetActions();
  });

  describe('getApiFilter', () => {
    const routerState: RouterState = {
      action: 'POP',
      location: {
        hash: '',
        key: '',
        pathname: '/',
        search: '',
        state: {},
      },
    };

    it('given multiple sort column in the sort state it returns a list', () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            sort: { column1: 'asc', column2: 'desc' },
          },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));
      params.append('order', JSON.stringify('ID asc'));

      expect(filter).toEqual(params);
    });

    it('given filter state it returns a filter', () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: {
              column1: { value: 'test', type: 'include' },
              column2: { endDate: '2019-09-18' },
            },
          },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('ID asc'));
      params.append('where', JSON.stringify({ column1: { like: 'test' } }));
      params.append(
        'where',
        JSON.stringify({ column2: { lte: '2019-09-18 23:59:59' } })
      );

      expect(filter).toEqual(params);
    });

    it('given a single sort column in the sort state it returns an order string', () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            sort: { column1: 'asc' },
          },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('ID asc'));

      expect(filter).toEqual(params);
    });

    it('given a empty sort and filters it returns just sorting by ID', () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('ID asc'));

      expect(filter).toEqual(params);
    });

    it('given both sort and filter state it returns both an order and where filter', () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            sort: { column1: 'asc', column2: 'desc' },
            filters: {
              column1: { value: 'test', type: 'exclude' },
              column2: { startDate: '2019-09-17' },
            },
          },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));
      params.append('order', JSON.stringify('ID asc'));
      params.append('where', JSON.stringify({ column1: { nlike: 'test' } }));
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

  it('clearTable returns a ClearTableType', () => {
    const action = clearTable();
    expect(action.type).toEqual(ClearTableType);
  });

  it('given JSON loadUrls returns a ConfigureUrlsType with ConfigureUrlsPayload', () => {
    const action = loadUrls({
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
    });
    expect(action.type).toEqual(ConfigureURLsType);
    expect(action.payload).toEqual({
      urls: {
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
      },
    });
  });

  it('given JSON loadFacilityName returns a ConfigureFacilityNameType with ConfigureFacilityNamePayload', () => {
    const action = loadFacilityName('Generic');
    expect(action.type).toEqual(ConfigureFacilityNameType);
    expect(action.payload).toEqual({
      facilityName: 'Generic',
    });
  });

  it('nestedValue returns empty string when provided with a falsy entry', () => {
    const datafileEntity: Entity = {
      ID: 0,
      NAME: 'test',
      MOD_TIME: '2019-09-17 00:00:00',
      CREATE_TIME: '2019-09-17 00:00:00',
      DATASET_ID: 0,
      test: null,
    };
    expect(nestedValue(datafileEntity, 'test')).toEqual('');
  });

  describe('async actions', () => {
    const routerState: RouterState = {
      action: 'POP',
      location: {
        hash: '',
        key: '',
        pathname: '/',
        search: '',
        state: {},
      },
    };

    const filterState: FiltersType = {
      column1: ['test'],
      column2: { endDate: '2019-09-18' },
    };
    const sortState: SortType = { column1: 'asc', column2: 'desc' };
    const queryState: QueryParams = {
      view: 'table',
      search: 'test',
      page: 1,
      results: 1,
      filters: filterState,
      sort: sortState,
    };

    const queryParams = new URLSearchParams();
    const filterParams = new URLSearchParams();
    const sortParams = new URLSearchParams();

    for (const [q, v] of Object.entries(queryState)) {
      if (q === 'filters' || q === 'sort') {
        queryParams.append(q, JSON.stringify(v));
      } else {
        queryParams.append(q, v);
      }
    }
    filterParams.append('filters', JSON.stringify(filterState));
    sortParams.append('sort', JSON.stringify(sortState));

    it('loadURLQuery dispatches clearTable, updateQueryParams', async () => {
      const getState = (): StateType => ({
        dgcommon: dGCommonInitialState,
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?${queryParams.toString()}&${filterParams.toString()}&${sortParams.toString()}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(true);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearTable());
      expect(actions).toContainEqual(updateQueryParams(queryState));
    });

    it('loadURLQuery dispatches clearData, updateQueryParams when passed false', async () => {
      const getState = (): StateType => ({
        dgcommon: dGCommonInitialState,
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?${queryParams.toString()}&${filterParams.toString()}&${sortParams.toString()}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(updateQueryParams(queryState));
    });

    it('loadURLQuery updates query for different dates', async () => {
      const newFilter = { DATE: { endDate: '2020-01-01' } };
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: { DATE: { startDate: '2000-01-01' } },
          },
        },
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?filters=${JSON.stringify(newFilter)}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(
        updateQueryParams({ ...initialState.query, filters: newFilter })
      );
    });

    it('loadURLQuery updates query for array with different values', async () => {
      const newFilter = { CUSTOM: ['a', 'b', 'c'] };
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: { CUSTOM: ['1', '2', '3'] },
          },
        },
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?filters=${JSON.stringify(newFilter)}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(
        updateQueryParams({ ...initialState.query, filters: newFilter })
      );
    });

    it('loadURLQuery updates query for new array', async () => {
      const newFilter = { CUSTOM: ['a', 'b', 'c'] };
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: { CUSTOM: 'a' },
          },
        },
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?filters=${JSON.stringify(newFilter)}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(
        updateQueryParams({ ...initialState.query, filters: newFilter })
      );
    });

    it('loadURLQuery updates query for different type', async () => {
      const newFilter = { ONE: 1 };
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: { ONE: '1' },
          },
        },
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?filters=${JSON.stringify(newFilter)}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(
        updateQueryParams({ ...initialState.query, filters: newFilter })
      );
    });

    it('loadURLQuery updates query for new key', async () => {
      const newFilter = { URL: 1 };
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: { STATE: 1 },
          },
        },
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?filters=${JSON.stringify(newFilter)}`,
            state: {},
          },
        },
      });
      const asyncAction = loadURLQuery(false);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearData());
      expect(actions).toContainEqual(
        updateQueryParams({ ...initialState.query, filters: newFilter })
      );
    });

    it('loadURLQuery logs errors when filters, sort are incorrectly formatted', async () => {
      // Remove characters from the search string to break formatting
      const errorParams = new URLSearchParams();
      for (const [q, v] of Object.entries(queryState)) {
        if (q === 'filters' || q === 'sort') {
          errorParams.append(q, JSON.stringify(v).slice(1));
        } else {
          errorParams.append(q, v);
        }
      }
      const getState = (): StateType => ({
        dgcommon: dGCommonInitialState,
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: `?${errorParams.toString()}`,
            state: {},
          },
        },
      });
      // Mock to prevent any actual error logging
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const asyncAction = loadURLQuery(true);
      await asyncAction(dispatch, getState);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        'Filter query provided in an incorrect format.'
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        'Sort query provided in an incorrect format.'
      );

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(clearTable());
      expect(actions).toContainEqual(
        updateQueryParams({ ...queryState, filters: {}, sort: {} })
      );

      spy.mockRestore();
    });

    it('pushPageView dispatches a updateView and push', async () => {
      const asyncAction = pushPageView('table', '');
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(updateView('table'));
      expect(actions).toContainEqual(push('?'));
    });

    it('pushPageSearch dispatches a updateSearch and push', async () => {
      const asyncAction = pushPageSearch('test');
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(updateSearch('test'));
      expect(actions).toContainEqual(push('?'));
    });

    it('pushPageNum dispatches a updatePage and push', async () => {
      const asyncAction = pushPageNum(1);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(updatePage(1));
      expect(actions).toContainEqual(push('?'));
    });

    it('pushPageResults dispatches a updateResults and push', async () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: queryState,
        },
        router: routerState,
      });

      const asyncAction = pushPageResults(1);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(updateResults(1));
      expect(actions).toContainEqual(push(`?${queryParams.toString()}`));
    });

    it('pushPageFilter dispatches a filterTable and push', async () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            filters: filterState,
          },
        },
        router: routerState,
      });

      const asyncAction = pushPageFilter('testKey', 'testValue');
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(filterTable('testKey', 'testValue'));
      expect(actions).toContainEqual(push(`?${filterParams.toString()}`));
    });

    it('pushPageSort dispatches a sortTable and push', async () => {
      const getState = (): StateType => ({
        dgcommon: {
          ...dGCommonInitialState,
          query: {
            ...dGCommonInitialState.query,
            sort: sortState,
          },
        },
        router: routerState,
      });

      const asyncAction = pushPageSort('test', 'asc');
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(sortTable('test', 'asc'));
      expect(actions).toContainEqual(push(`?${sortParams.toString()}`));
    });

    it('pushQuery dispatches an updateQueryParams and push', async () => {
      const asyncAction = pushQuery(queryState);
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(2);
      expect(actions).toContainEqual(updateQueryParams(queryState));
      expect(actions).toContainEqual(push('?'));
    });

    it('saveView dispatches an updateSaveView action', async () => {
      const asyncAction = saveView('table');
      await asyncAction(dispatch, getState);

      expect(actions.length).toEqual(1);
      expect(actions).toContainEqual(updateSaveView('table'));
    });
  });
});
