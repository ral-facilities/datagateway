import {
  fetchFacilityCycles,
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchFacilityCyclesFailure,
  fetchFacilityCycleCount,
  fetchFacilityCycleCountRequest,
  fetchFacilityCycleCountSuccess,
  fetchFacilityCycleCountFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { FacilityCycle } from 'datagateway-common';

jest.mock('loglevel');

describe('FacilityCycle actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchFacilityCyclesRequest and fetchFacilityCyclesSuccess actions upon successful fetchFacilityCycles action', async () => {
    const mockData: FacilityCycle[] = [
      {
        ID: 1,
        NAME: 'Test 1',
        DESCRIPTION: 'Test 1',
        STARTDATE: '2019-07-03',
        ENDDATE: '2019-07-04',
      },
      {
        ID: 2,
        NAME: 'Test 2',
        DESCRIPTION: 'Test 2',
        STARTDATE: '2019-07-03',
        ENDDATE: '2019-07-04',
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchFacilityCycles(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest(1));
    expect(actions[1]).toEqual(fetchFacilityCyclesSuccess(mockData, 1));
  });

  it('fetchFacilityCycles action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchFacilityCycles(1);
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest(1));

    expect(actions[1]).toEqual(fetchFacilityCyclesSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/instruments/1/facilitycycles',
      expect.objectContaining({
        params,
      })
    );
  });

  it('dispatches fetchFacilityCyclesRequest and fetchFacilityCyclesFailure actions upon unsuccessful fetchFacilityCycles action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchFacilityCycles(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest(1));
    expect(actions[1]).toEqual(
      fetchFacilityCyclesFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchFacilityCycleCountRequest and fetchFacilityCycleCountSuccess actions upon successful fetchFacilityCycleCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchFacilityCycleCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCycleCountRequest(1));
    expect(actions[1]).toEqual(fetchFacilityCycleCountSuccess(2, 1));
  });

  it('fetchFacilityCycleCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const asyncAction = fetchFacilityCycleCount();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCycleCountRequest(1));

    expect(actions[1]).toEqual(fetchFacilityCycleCountSuccess(1, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/facilitycycles/count',
      expect.objectContaining({
        params,
      })
    );
  });

  it('dispatches fetchFacilityCycleCountRequest and fetchFacilityCycleCountFailure actions upon unsuccessful fetchFacilityCycleCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchFacilityCycleCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCycleCountRequest(1));
    expect(actions[1]).toEqual(
      fetchFacilityCycleCountFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
