import {
  sortTable,
  filterTable,
  getApiFilter,
  loadUrls,
  loadFacilityName,
  clearTable,
} from '.';
import {
  SortTableType,
  FilterTableType,
  ClearTableType,
  ConfigureURLsType,
  ConfigureFacilityNameType,
  // SaveQueriesType,
} from './actions.types';
import { StateType } from '../app.types';
import { RouterState } from 'connected-react-router';
import axios from 'axios';
import * as log from 'loglevel';
import { resetActions } from '../../setupTests';
import { initialState as dGCommonInitialState } from '../reducers/dgcommon.reducer';

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
          sort: { column1: 'asc', column2: 'desc' },
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
          filters: {
            column1: 'test',
            column2: { endDate: '2019-09-18' },
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
          sort: { column1: 'asc' },
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
          sort: { column1: 'asc', column2: 'desc' },
          filters: { column1: 'test', column2: { startDate: '2019-09-17' } },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));
      params.append('order', JSON.stringify('ID asc'));
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

  // TODO: Implement test for save query.
  // it.skip('given a saveQueries returns a SaveQueriesType with SaveQueriesPayload', () => {});
});
