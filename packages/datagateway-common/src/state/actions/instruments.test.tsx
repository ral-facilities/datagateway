import {
  fetchInstruments,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  fetchInstrumentDetails,
  fetchInstrumentDetailsRequest,
  fetchInstrumentDetailsSuccess,
  fetchInstrumentDetailsFailure,
  fetchInstrumentCount,
  fetchInstrumentCountRequest,
  fetchInstrumentCountSuccess,
  fetchInstrumentCountFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgcommon.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import { Instrument } from '../../app.types';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('Instrument actions', () => {
  beforeEach(() => {
    Date.now = jest.fn().mockImplementation(() => 1);
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchInstrumentsRequest and fetchInstrumentsSuccess actions upon successful fetchInstruments action', async () => {
    const mockData: Instrument[] = [
      {
        id: 1,
        name: 'Test 1',
      },
      {
        id: 2,
        name: 'Test 2',
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInstruments();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentsRequest(1));
    expect(actions[1]).toEqual(fetchInstrumentsSuccess(mockData, 1));
  });

  it('fetchInstruments action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchInstruments();
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

    expect(actions[0]).toEqual(fetchInstrumentsRequest(1));

    expect(actions[1]).toEqual(fetchInstrumentsSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith('/instruments', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchInstrumentsRequest and fetchInstrumentsFailure actions upon unsuccessful fetchInstruments action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInstruments();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentsRequest(1));
    expect(actions[1]).toEqual(fetchInstrumentsFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchInstruments applies skip and limit when specified via optional parameters', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchInstruments({ startIndex: 0, stopIndex: 49 });

    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
      },
    });
    await asyncAction(dispatch, getState, null);

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('id asc'));
    params.append('skip', JSON.stringify(0));
    params.append('limit', JSON.stringify(50));

    expect(axios.get).toHaveBeenCalledWith('/instruments', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchInstrumentCountRequest and fetchInstrumentCountSuccess actions upon successful fetchInstrumentCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 6,
      })
    );

    const asyncAction = fetchInstrumentCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentCountRequest(1));
    expect(actions[1]).toEqual(fetchInstrumentCountSuccess(6, 1));
  });

  it('fetchInstrumentCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 9,
      })
    );

    const asyncAction = fetchInstrumentCount();
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

    expect(actions[0]).toEqual(fetchInstrumentCountRequest(1));

    expect(actions[1]).toEqual(fetchInstrumentCountSuccess(9, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith('/instruments/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchInstrumentCountRequest and fetchInstrumentCountFailure actions upon unsuccessful fetchInstrumentCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInstrumentCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentCountRequest(1));
    expect(actions[1]).toEqual(
      fetchInstrumentCountFailure('Test error message')
    );

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('dispatches fetchInstrumentDetailsRequest and fetchInstrumentDetailsSuccess actions upon successful fetchInstrumentDetails action', async () => {
    const mockData: Instrument[] = [
      {
        id: 1,
        name: 'Test 1',
        instrumentScientists: [
          {
            id: 2,
            user: {
              id: 3,
              name: 'Louise',
            },
          },
        ],
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInstrumentDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentDetailsRequest());
    expect(actions[1]).toEqual(fetchInstrumentDetailsSuccess(mockData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ id: { eq: 1 } }));
    params.append('include', JSON.stringify({ instrumentScientists: 'user' }));

    expect(axios.get).toHaveBeenCalledWith('/instruments', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchInstrumentDetailsRequest and fetchInstrumentDetailsFailure actions upon unsuccessful fetchInstrumentDetails action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInstrumentDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentDetailsRequest());
    expect(actions[1]).toEqual(
      fetchInstrumentDetailsFailure('Test error message')
    );

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });
});
