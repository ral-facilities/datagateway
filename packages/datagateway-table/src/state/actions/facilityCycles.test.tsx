import {
  fetchFacilityCycles,
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchFacilityCyclesFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { FacilityCycle } from 'datagateway-common';

jest.mock('loglevel');

describe('FacilityCycle actions', () => {
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

    const asyncAction = fetchFacilityCycles();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest());
    expect(actions[1]).toEqual(fetchFacilityCyclesSuccess(mockData));
  });

  it('fetchFacilityCycles action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchFacilityCycles();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest());

    expect(actions[1]).toEqual(fetchFacilityCyclesSuccess([]));

    expect(axios.get).toHaveBeenCalledWith(
      '/facilitycycles',
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

  it('dispatches fetchFacilityCyclesRequest and fetchFacilityCyclesFailure actions upon unsuccessful fetchFacilityCycles action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchFacilityCycles();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchFacilityCyclesRequest());
    expect(actions[1]).toEqual(
      fetchFacilityCyclesFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
