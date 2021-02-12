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
import { initialState } from '../reducers/dgcommon.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import { FacilityCycle } from '../../app.types';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('FacilityCycle actions', () => {
  beforeEach(() => {
    Date.now = jest.fn().mockImplementation(() => 1);
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
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
      dgcommon: {
        ...initialState,
        query: {
          ...initialState.query,
          sort: { column1: 'desc' },
          filters: {
            column1: { value: '1', type: 'include' },
            column2: { value: '2', type: 'include' },
          },
        },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest(1));

    expect(actions[1]).toEqual(fetchFacilityCyclesSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('ID asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith('/instruments/1/facilitycycles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
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

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('dispatches fetchFacilityCycleCountRequest and fetchFacilityCycleCountSuccess actions upon successful fetchFacilityCycleCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchFacilityCycleCount(1);
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

    const asyncAction = fetchFacilityCycleCount(1);
    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        query: {
          ...initialState.query,
          filters: {
            column1: { value: '1', type: 'include' },
            column2: { value: '2', type: 'include' },
          },
        },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCycleCountRequest(1));

    expect(actions[1]).toEqual(fetchFacilityCycleCountSuccess(1, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/instruments/1/facilitycycles/count',
      {
        headers: { Authorization: 'Bearer null' },
        params,
      }
    );
  });

  it('dispatches fetchFacilityCycleCountRequest and fetchFacilityCycleCountFailure actions upon unsuccessful fetchFacilityCycleCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchFacilityCycleCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCycleCountRequest(1));
    expect(actions[1]).toEqual(
      fetchFacilityCycleCountFailure('Test error message')
    );

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchFacilityCycles applies skip and limit when specified via optional parameters', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchFacilityCycles(1, {
      startIndex: 0,
      stopIndex: 49,
    });

    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
      },
    });
    await asyncAction(dispatch, getState, null);

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('ID asc'));
    params.append('skip', JSON.stringify(0));
    params.append('limit', JSON.stringify(50));

    expect(axios.get).toHaveBeenCalledWith('/instruments/1/facilitycycles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });
});
