import {
  sortTable,
  filterTable,
  getApiFilter,
  loadStrings,
  configureApp,
  configureStrings,
  loadFeatureSwitches,
} from '.';
import { SortTableType, FilterTableType } from './actions.types';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import { RouterState } from 'connected-react-router';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, resetActions, dispatch, getState } from '../../setupTests';

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

    it('given a empty sort anf filters it returns an empty object', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
        },
        router: routerState,
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
        router: routerState,
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
        router: routerState,
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
        router: routerState,
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
        router: routerState,
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

  it('settings are loaded and configureStrings and loadFeatureSwitches actions are sent', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            features: {
              investigationGetSize: true,
              investigationGetCount: true,
              datasetGetSize: true,
              datasetGetCount: true,
            },
            'ui-strings': '/res/default.json',
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(2);
    expect(actions).toContainEqual(
      loadFeatureSwitches({
        investigationGetSize: true,
        investigationGetCount: true,
        datasetGetSize: true,
        datasetGetCount: true,
      })
    );
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
  });

  it('settings are loaded despite no features and no leading slash on ui-strings', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            'ui-strings': 'res/default.json',
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(1);
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
  });

  it('logs an error if settings.json fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Error loading settings.json: `)
    );
  });

  it('logs an error if settings.json is invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading settings.json: Invalid format'
    );
  });

  it('logs an error if loadStrings fails to resolve', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const path = 'non/existent/path';

    const asyncAction = loadStrings(path);
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Failed to read strings from ${path}: `)
    );
  });
});
