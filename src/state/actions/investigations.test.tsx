import {
  fetchInvestigations,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
} from '.';
import { StateType, Investigation } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { fetchInvestigationDatasetsCountRequest } from './datasets';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import {
  fetchInvestigationCount,
  fetchInvestigationCountRequest,
  fetchInvestigationCountSuccess,
  fetchInvestigationCountFailure,
} from './investigations';

jest.mock('loglevel');

describe('Investigation actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchInvestigationsRequest and fetchInvestigationsSuccess actions upon successful fetchInvestigations action', async () => {
    const mockData: Investigation[] = [
      {
        ID: 1,
        TITLE: 'Test 1',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        INSTRUMENT: {
          NAME: 'LARMOR',
        },
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-11',
      },
      {
        ID: 2,
        TITLE: 'Test 2',
        VISIT_ID: '2',
        RB_NUMBER: '2',
        DOI: 'doi 2',
        SIZE: 10000,
        INSTRUMENT: {
          NAME: 'LARMOR',
        },
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-12',
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInvestigations();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(fetchInvestigationsSuccess(mockData));
    expect(actions[2]).toEqual(fetchInvestigationDatasetsCountRequest());
    expect(actions[3]).toEqual(fetchInvestigationDatasetsCountRequest());
  });

  it('fetchInvestigations action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchInvestigations();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());

    expect(actions[1]).toEqual(fetchInvestigationsSuccess([]));

    expect(axios.get).toHaveBeenCalledWith(
      '/investigations',
      expect.objectContaining({
        params: {
          filter: {
            order: 'column1 desc',
            where: { column1: '1', column2: '2' },
          },
        },
      })
    );
  });

  it('dispatches fetchInvestigationsRequest and fetchInvestigationsFailure actions upon unsuccessful fetchInvestigations action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInvestigations();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(
      fetchInvestigationsFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchInvestigationCountRequest and fetchInvestigationCountSuccess actions upon successful fetchInvestigationCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 4,
      })
    );

    const asyncAction = fetchInvestigationCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationCountRequest());
    expect(actions[1]).toEqual(fetchInvestigationCountSuccess(4));
  });

  it('fetchInvestigationCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 7,
      })
    );

    const asyncAction = fetchInvestigationCount();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationCountRequest());

    expect(actions[1]).toEqual(fetchInvestigationCountSuccess(7));

    expect(axios.get).toHaveBeenCalledWith(
      '/investigations/count',
      expect.objectContaining({
        params: {
          filter: {
            where: { column1: '1', column2: '2' },
          },
        },
      })
    );
  });

  it('dispatches fetchInvestigationCountRequest and fetchInvestigationCountFailure actions upon unsuccessful fetchInvestigationCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInvestigationCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationCountRequest());
    expect(actions[1]).toEqual(
      fetchInvestigationCountFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
