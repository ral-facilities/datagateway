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
  fetchDatasetSize,
  fetchDatasetSizeRequest,
  fetchDatasetSizeSuccess,
  fetchDatasetSizeFailure,
} from '.';
import { StateType, EntityCache } from '../app.types';
import { initialState } from '../reducers/dgcommon.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import { Dataset } from '../../app.types';
import { fetchDatasetDatafilesCountRequest } from './datafiles';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('Dataset actions', () => {
  const mockData: Dataset[] = [
    {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    },
    {
      id: 2,
      name: 'Test 2',
      modTime: '2019-06-10',
      createTime: '2019-06-12',
    },
  ];

  // Investigation cache for investigation ID 1 which has 2 datasets.
  const mockInvestigationCache: EntityCache = {
    1: {
      childEntityCount: 2,
      childEntitySize: null,
    },
  };

  // Dataset cache for dataset ID 1 which has a size of 10000.
  const mockDatasetCache: EntityCache = {
    1: {
      childEntitySize: 10000,
      childEntityCount: null,
    },
  };

  beforeEach(() => {
    Date.now = jest.fn().mockImplementation(() => 1);
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: mockData,
      })
    );
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsSuccess actions upon successful fetchDatasets action', async () => {
    const asyncAction = fetchDatasets({
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ 'investigation.id': { eq: 1 } }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ],
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));

    expect(axios.get).toHaveBeenCalledWith('/datasets', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('fetchDatasets action applies filters and sort state to request params', async () => {
    const asyncAction = fetchDatasets({
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ 'investigation.id': { eq: 1 } }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ],
    });
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

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));

    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));

    expect(axios.get).toHaveBeenCalledWith('/datasets', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('fetchDatasets action sends fetchDatafileCount actions when specified via optional parameters', async () => {
    const asyncAction = fetchDatasets({
      getDatafileCount: true,
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

    const asyncAction = fetchDatasets();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchDataset action sends fetchDatasetSize actions when specified via optional parameters', async () => {
    const asyncAction = fetchDatasets({
      getSize: true,
    });
    await asyncAction(dispatch, getState, null);

    expect(actions).toHaveLength(6);
    expect(actions[0]).toEqual(fetchDatasetsRequest(1));
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData, 1));
    expect(actions[2]).toEqual(fetchDatasetSizeRequest());
  });

  it('dispatches fetchDatasetSizeRequest and fetchDatasetSizeSuccess actions upon successful fetchDatasetSize action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 10000,
      })
    );

    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        facilityName: 'LILS',
      },
    });

    const asyncAction = fetchDatasetSize(1);
    await asyncAction(dispatch, getState, null);

    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual(fetchDatasetSizeRequest());
    expect(actions[1]).toEqual(fetchDatasetSizeSuccess(1, 10000));
    expect(axios.get).toHaveBeenCalledWith(
      '/user/getSize',
      expect.objectContaining({
        params: {
          sessionId: null,
          facilityName: 'LILS',
          entityType: 'dataset',
          entityId: 1,
        },
      })
    );
  });

  it('dispatches fetchDatasetSizeRequest and fetchDatasetSizeSuccess actions upon existing dataset cache and successful fetchDatasetSize action', async () => {
    const asyncAction = fetchDatasetSize(1);

    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        data: mockData,
        datasetCache: mockDatasetCache,
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual(fetchDatasetSizeRequest());
    expect(actions[1]).toEqual(fetchDatasetSizeSuccess(1, 10000));
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('dispatches fetchInvestigationSizeRequest and fetchInvestigationSizeFailure action upon unsuccessful fetchInvestigationsSize action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetSize(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetSizeRequest());
    expect(actions[1]).toEqual(fetchDatasetSizeFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith(
      { message: 'Test error message' },
      false
    );
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountSuccess actions upon successful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 7,
      })
    );

    const asyncAction = fetchDatasetCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'investigation.id': { eq: 1 } }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));
    expect(actions[1]).toEqual(fetchDatasetCountSuccess(7, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));

    expect(axios.get).toHaveBeenCalledWith('/datasets/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('fetchDatasetCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 8,
      })
    );

    const asyncAction = fetchDatasetCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'investigation.id': { eq: 1 } }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
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

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));

    expect(actions[1]).toEqual(fetchDatasetCountSuccess(8, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));

    expect(axios.get).toHaveBeenCalledWith('/datasets/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountFailure actions upon unsuccessful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest(1));
    expect(actions[1]).toEqual(fetchDatasetCountFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchDatasets applies skip and limit when specified via optional parameters', async () => {
    const asyncAction = fetchDatasets({
      offsetParams: { startIndex: 0, stopIndex: 49 },
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ 'investigation.id': { eq: 1 } }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ],
    });

    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
      },
    });
    await asyncAction(dispatch, getState, null);

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));
    params.append('skip', JSON.stringify(0));
    params.append('limit', JSON.stringify(50));

    expect(axios.get).toHaveBeenCalledWith('/datasets', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchDatasetDetailsRequest and fetchDatasetDetailsSuccess actions upon successful fetchDatasetDetails action', async () => {
    const mockDetailsData: Dataset[] = [
      {
        id: 1,
        name: 'Test 1',
        modTime: '2019-06-10',
        createTime: '2019-06-11',
        type: {
          id: 2,
          name: 'Test type',
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
    params.append('where', JSON.stringify({ id: { eq: 1 } }));
    params.append('include', JSON.stringify('type'));

    expect(axios.get).toHaveBeenCalledWith('/datasets', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
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

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
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

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    params.append('include', JSON.stringify('investigation'));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({ params })
    );
  });

  it('dispatches fetchInvestigationDatasetsCountRequest and fetchInvestigationDatasetsCountSuccess actions upon existing investigation cache and successful fetchInvestigationDatasetsCount action', async () => {
    const asyncAction = fetchInvestigationDatasetsCount(1);

    // Set up the state for calling fetchInvestigationDatasetsCountSuccess with investigation cache.
    const getState = (): Partial<StateType> => ({
      dgcommon: {
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

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith(
      { message: 'Test error message' },
      false
    );
  });

  it('dispatches downloadDatasetRequest and clicks on IDS link upon downloadDataset action', async () => {
    jest.spyOn(document, 'createElement');
    jest.spyOn(document.body, 'appendChild');

    const asyncAction = downloadDataset(1, 'test');
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(downloadDatasetRequest(1));

    expect(document.createElement).toHaveBeenCalledWith('a');
    const link = document.createElement('a');
    link.href = `/getData?sessionId=${null}&datasetIds=${1}&compress=${false}&zip=${true}&outname=${'test'}`;
    link.target = '_blank';
    link.style.display = 'none';
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
  });
});
