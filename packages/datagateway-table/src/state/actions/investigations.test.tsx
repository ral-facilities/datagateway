import {
  fetchInvestigations,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
  fetchInvestigationDetailsRequest,
  fetchInvestigationDetailsSuccess,
  fetchInvestigationDetailsFailure,
  fetchInvestigationDetails,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { fetchDatasetCountRequest } from './datasets';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { Investigation } from 'datagateway-common';

jest.mock('loglevel');

describe('Investigation actions', () => {
  const mockData: Investigation[] = [
    {
      ID: 1,
      TITLE: 'Test 1',
      NAME: 'Test 1',
      VISIT_ID: '1',
      RB_NUMBER: '1',
      DOI: 'doi 1',
      SIZE: 1,
      INVESTIGATIONINSTRUMENT: [
        {
          ID: 3,
          INVESTIGATION_ID: 1,
          INSTRUMENT_ID: 4,
          INSTRUMENT: {
            ID: 4,
            NAME: 'LARMOR',
          },
        },
      ],
      STARTDATE: '2019-06-10',
      ENDDATE: '2019-06-11',
    },
    {
      ID: 2,
      TITLE: 'Test 2',
      NAME: 'Test 2',
      VISIT_ID: '2',
      RB_NUMBER: '2',
      DOI: 'doi 2',
      SIZE: 10000,
      INVESTIGATIONINSTRUMENT: [
        {
          ID: 5,
          INVESTIGATION_ID: 2,
          INSTRUMENT_ID: 3,
          INSTRUMENT: {
            ID: 4,
            NAME: 'LARMOR',
          },
        },
      ],
      STARTDATE: '2019-06-10',
      ENDDATE: '2019-06-12',
    },
  ];

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchInvestigationsRequest and fetchInvestigationsSuccess actions upon successful fetchInvestigations action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInvestigations();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(fetchInvestigationsSuccess(mockData));
  });

  it('dispatches fetchDatasetCountRequests upon successful fetchInvestigations action if investigationGetCount feature switch is set', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInvestigations();
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        features: {
          ...initialState.features,
          investigationGetCount: true,
        },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(fetchInvestigationsSuccess(mockData));
    expect(actions[2]).toEqual(fetchDatasetCountRequest());
    expect(actions[3]).toEqual(fetchDatasetCountRequest());
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

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/investigations',
      expect.objectContaining({
        params,
      })
    );
  });

  it('fetchInvestigations action applies additionalFilters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchInvestigations([
      { filterType: 'order', filterValue: 'column1 desc' },
      {
        filterType: 'where',
        filterValue: JSON.stringify({ column1: { like: '1' } }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({ column2: { like: '2' } }),
      },
    ]);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(fetchInvestigationsSuccess([]));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/investigations',
      expect.objectContaining({
        params,
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

  it('dispatches fetchInvestigationDetailsRequest and fetchInvestigationDetailsSuccess actions upon successful fetchInvestigationDetails action', async () => {
    const mockData: Investigation[] = [
      {
        ID: 1,
        TITLE: 'Test 1',
        NAME: 'Test 1',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-11',
        INVESTIGATIONUSER: [
          {
            ID: 2,
            INVESTIGATION_ID: 1,
            USER_ID: 3,
            ROLE: 'Investigator',
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

    const asyncAction = fetchInvestigationDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationDetailsRequest());
    expect(actions[1]).toEqual(fetchInvestigationDetailsSuccess(mockData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ ID: { eq: 1 } }));
    params.append(
      'include',
      JSON.stringify([{ INVESTIGATIONUSER: 'USER_' }, 'SAMPLE', 'PUBLICATION'])
    );

    expect(axios.get).toHaveBeenCalledWith(
      '/investigations',
      expect.objectContaining({ params })
    );
  });

  it('dispatches fetchInvestigationDetailsRequest and fetchInvestigationDetailsFailure actions upon unsuccessful fetchInvestigationDetails action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInvestigationDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationDetailsRequest());
    expect(actions[1]).toEqual(
      fetchInvestigationDetailsFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
