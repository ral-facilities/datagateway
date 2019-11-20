import {
  fetchDatasets,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
  fetchInvestigationDatasetsCount,
  fetchInvestigationDatasetsCountRequest,
  fetchInvestigationDatasetsCountSuccess,
  fetchInvestigationDatasetsCountFailure,
  downloadDataset,
  downloadDatasetRequest,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCount,
  fetchDatasetCountFailure,
  fetchDatasetDetails,
  fetchDatasetDetailsRequest,
  fetchDatasetDetailsSuccess,
  fetchDatasetDetailsFailure,
  fetchDatasetDatafilesCountRequest,
} from '.';
import { StateType, EntityCache } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { Dataset } from 'datagateway-common';

jest.mock('loglevel');

describe('Dataset actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);

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

  // Investigation cache for investigation ID 1 which has 2 datasets.
  const mockInvestigationCache: EntityCache = {
    1: {
      childEntityCount: 2,
    },
  };

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsSuccess actions upon successful fetchDatasets action', async () => {
    const asyncAction = fetchDatasets({ investigationId: 1 });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));

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
    const asyncAction = fetchDatasets({ investigationId: 1 });
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));

    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));

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
    const asyncAction = fetchDatasets({
      investigationId: 1,
      optionalParams: { getDatafileCount: true },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));
    expect(actions[2]).toEqual(fetchDatasetDatafilesCountRequest(1));
    expect(actions[3]).toEqual(fetchDatasetDatafilesCountRequest(1));
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsFailure actions upon unsuccessful fetchDatasets action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasets({ investigationId: 1 });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsFailure('Test error message'));

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountSuccess actions upon successful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 7,
      })
    );

    const asyncAction = fetchDatasetCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));
    expect(actions[1]).toEqual(fetchDatasetCountSuccess(7, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ INVESTIGATION_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({
        params,
      })
    );
  });

  it('fetchDatasetCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 8,
      })
    );

    const asyncAction = fetchDatasetCount(1);
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));

    expect(actions[1]).toEqual(fetchDatasetCountSuccess(8, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ INVESTIGATION_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({
        params,
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

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));
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

  it('dispatches fetchInvestigationDatasetsCountRequest and fetchInvestigationDatasetsCountSuccess actions upon successful fetchInvestigationDatasetsCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchInvestigationDatasetsCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationDatasetsCountRequest(1));
    expect(actions[1]).toEqual(fetchInvestigationDatasetsCountSuccess(1, 2, 1));
    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({
        params: {
          where: { INVESTIGATION_ID: { eq: 1 } },
        },
      })
    );
  });

  it('dispatches fetchInvestigationDatasetsCountRequest and fetchInvestigationDatasetsCountSuccess actions upon existing investigation cache and successful fetchInvestigationDatasetsCount action', async () => {
    const asyncAction = fetchInvestigationDatasetsCount(1);

    // Set up the state for calling fetchInvestigationDatasetsCountSuccess with investigation cache.
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        data: mockData,
        investigationCache: mockInvestigationCache,
      },
    });

    await asyncAction(dispatch, getState, null);

    // Expect only two actions; fetchInvestigationDatasetsCountRequest and the fetchInvestigationDatasetsCountSucess
    // (given Investigation ID 1 and the dataset count to be 2).
    // We do not expect an GET request from axios to have been called.
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual(fetchInvestigationDatasetsCountRequest(1));
    expect(actions[1]).toEqual(fetchInvestigationDatasetsCountSuccess(1, 2, 1));
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('dispatches fetchInvestigationDatasetsCountRequest and fetchInvestigationDatasetsCountFailure actions upon unsuccessful fetchInvestigationDatasetsCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInvestigationDatasetsCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationDatasetsCountRequest(1));
    expect(actions[1]).toEqual(
      fetchInvestigationDatasetsCountFailure('Test error message')
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

    expect(actions[0]).toEqual(downloadDatasetRequest(1));

    expect(document.createElement).toHaveBeenCalledWith('a');
    let link = document.createElement('a');
    link.href = `/getData?sessionId=${null}&datasetIds=${1}&compress=${false}&zip=${true}&outname=${'test'}`;
    link.target = '_blank';
    link.style.display = 'none';
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
  });
});
