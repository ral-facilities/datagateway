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
  Date.now = jest.fn().mockImplementation(() => 1);

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchInstrumentsRequest and fetchInstrumentsSuccess actions upon successful fetchInstruments action', async () => {
    const mockData: Instrument[] = [
      {
        ID: 1,
        NAME: 'Test 1',
      },
      {
        ID: 2,
        NAME: 'Test 2',
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
          filters: { column1: '1', column2: '2' },
        },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentsRequest(1));

    expect(actions[1]).toEqual(fetchInstrumentsSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('ID asc'));
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
    const asyncAction = fetchInstruments({ startIndex: 0, stopIndex: 49 });

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
          filters: { column1: '1', column2: '2' },
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
        ID: 1,
        NAME: 'Test 1',
        INSTRUMENTSCIENTIST: [
          {
            ID: 2,
            INSTRUMENT_ID: 1,
            USER_ID: 3,
            USER_: {
              ID: 3,
              NAME: 'Louise',
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
    params.append('where', JSON.stringify({ ID: { eq: 1 } }));
    params.append('include', JSON.stringify({ INSTRUMENTSCIENTIST: 'USER_' }));

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
