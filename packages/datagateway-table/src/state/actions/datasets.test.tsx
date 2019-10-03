import {
  fetchDatasets,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import {
  fetchDatasetCount,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCountFailure,
  downloadDataset,
  downloadDatasetRequest,
  fetchDatasetDetails,
  fetchDatasetDetailsRequest,
  fetchDatasetDetailsSuccess,
  fetchDatasetDetailsFailure,
} from './datasets';
import { fetchDatafileCountRequest } from './datafiles';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { Dataset } from 'datagateway-common';

jest.mock('loglevel');

describe('Dataset actions', () => {
  const mockData: Dataset[] = [
    {
      ID: 1,
      NAME: 'Test 1',
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-11',
      INVESTIGATION_ID: 1,
    },
    {
      ID: 2,
      NAME: 'Test 2',
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-12',
      INVESTIGATION_ID: 1,
    },
  ];

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({
      data: mockData,
    })
  );

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsSuccess actions upon successful fetchDatasets action', async () => {
    const asyncAction = fetchDatasets(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ INVESTIGATION_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets',
      expect.objectContaining({
        params,
      })
    );
  });

  it('fetchDatasets action applies filters and sort state to request params', async () => {
    const asyncAction = fetchDatasets(1);
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());

    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ INVESTIGATION_ID: { eq: 1 } }));
    params.append('order', JSON.stringify('column1 desc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets',
      expect.objectContaining({
        params,
      })
    );
  });

  it('fetchDatasets action sends fetchDatafileCount actions when specified via optional parameters', async () => {
    const asyncAction = fetchDatasets(1, { getDatafileCount: true });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData));
    expect(actions[2]).toEqual(fetchDatafileCountRequest());
    expect(actions[3]).toEqual(fetchDatafileCountRequest());
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsFailure actions upon unsuccessful fetchDatasets action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasets(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());
    expect(actions[1]).toEqual(fetchDatasetsFailure('Test error message'));

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountSuccess actions upon successful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchDatasetCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest());
    expect(actions[1]).toEqual(fetchDatasetCountSuccess(1, 2));
    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({
        params: {
          where: { INVESTIGATION_ID: { eq: 1 } },
        },
      })
    );
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountFailure actions upon unsuccessful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest());
    expect(actions[1]).toEqual(fetchDatasetCountFailure('Test error message'));

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchDatasetDetailsRequest and fetchDatasetDetailsSuccess actions upon successful fetchDatasetDetails action', async () => {
    const mockDetailsData: Dataset[] = [
      {
        ID: 1,
        NAME: 'Test 1',
        MOD_TIME: '2019-06-10',
        CREATE_TIME: '2019-06-11',
        INVESTIGATION_ID: 1,
        DATASETTYPE: {
          ID: 2,
          NAME: 'Test type',
        },
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockDetailsData,
      })
    );

    const asyncAction = fetchDatasetDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetDetailsRequest());
    expect(actions[1]).toEqual(fetchDatasetDetailsSuccess(mockDetailsData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ ID: { eq: 1 } }));
    params.append('include', JSON.stringify('DATASETTYPE'));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets',
      expect.objectContaining({ params })
    );
  });

  it('dispatches fetchDatasetDetailsRequest and fetchDatasetDetailsFailure actions upon unsuccessful fetchDatasetDetails action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetDetailsRequest());
    expect(actions[1]).toEqual(
      fetchDatasetDetailsFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches downloadDatasetRequest and clicks on IDS link upon downloadDataset action', async () => {
    jest.spyOn(document, 'createElement');
    jest.spyOn(document.body, 'appendChild');

    const asyncAction = downloadDataset(1, 'test');
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(downloadDatasetRequest());

    expect(document.createElement).toHaveBeenCalledWith('a');
    let link = document.createElement('a');
    link.href = `/getData?sessionId=${null}&datasetIds=${1}&compress=${false}&zip=${true}&outname=${'test'}`;
    link.target = '_blank';
    link.style.display = 'none';
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
  });
});
