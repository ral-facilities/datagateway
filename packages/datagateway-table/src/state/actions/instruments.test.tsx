import {
  fetchInstruments,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  fetchInstrumentDetails,
  fetchInstrumentDetailsRequest,
  fetchInstrumentDetailsSuccess,
  fetchInstrumentDetailsFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { Instrument } from 'datagateway-common';

jest.mock('loglevel');

describe('Instrument actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
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

    expect(actions[0]).toEqual(fetchInstrumentsRequest());
    expect(actions[1]).toEqual(fetchInstrumentsSuccess(mockData));
  });

  it('fetchInstruments action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchInstruments();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentsRequest());

    expect(actions[1]).toEqual(fetchInstrumentsSuccess([]));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/instruments',
      expect.objectContaining({
        params,
      })
    );
  });

  it('dispatches fetchInstrumentsRequest and fetchInstrumentsFailure actions upon unsuccessful fetchInstruments action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInstruments();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInstrumentsRequest());
    expect(actions[1]).toEqual(fetchInstrumentsFailure('Test error message'));

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
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
    params.append('include', JSON.stringify({ INSTRUMENTUSER: 'USER_' }));

    expect(axios.get).toHaveBeenCalledWith(
      '/instruments',
      expect.objectContaining({ params })
    );
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

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
