import {
  fetchDatafiles,
  fetchDatafilesRequest,
  fetchDatafilesSuccess,
  fetchDatafilesFailure,
  fetchDatasetDatafilesCount,
  fetchDatasetDatafilesCountRequest,
  fetchDatasetDatafilesCountSuccess,
  fetchDatasetDatafilesCountFailure,
  downloadDatafile,
  downloadDatafileRequest,
  fetchDatafileCount,
  fetchDatafileCountRequest,
  fetchDatafileCountSuccess,
  fetchDatafileCountFailure,
  fetchDatafileDetailsSuccess,
  fetchDatafileDetails,
  fetchDatafileDetailsRequest,
  fetchDatafileDetailsFailure,
} from '.';
import axios from 'axios';
import { StateType, EntityCache } from '../app.types';
import { initialState } from '../reducers/dgcommon.reducer';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import * as log from 'loglevel';
import { Datafile } from '../../app.types';

jest.mock('loglevel');
jest.mock('axios');

describe('Datafile actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);
  const mockData: Datafile[] = [
    {
      ID: 1,
      NAME: 'Test 1',
      LOCATION: '/test1',
      FILESIZE: 1,
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-10',
      DATASET_ID: 1,
    },
    {
      ID: 2,
      NAME: 'Test 2',
      LOCATION: '/test2',
      FILESIZE: 2,
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-10',
      DATASET_ID: 1,
    },
  ];

  // Dataset cache for dataset ID 1 which has 2 datafiles.
  const mockDatasetCache: EntityCache = {
    1: {
      childEntityCount: 2,
      childEntitySize: 3,
    },
  };

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchDatafilesRequest and fetchDatafilesSuccess actions upon successful fetchDatafiles action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchDatafiles(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));
    expect(actions[1]).toEqual(fetchDatafilesSuccess(mockData, 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('ID asc'));
    params.append('where', JSON.stringify({ DATASET_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith('/datafiles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('fetchDatafiles action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchDatafiles(1);
    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        sort: { column1: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));

    expect(actions[1]).toEqual(fetchDatafilesSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('ID asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ DATASET_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith('/datafiles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchDatafilesRequest and fetchDatafilesFailure actions upon unsuccessful fetchDatafiles action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatafiles(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));
    expect(actions[1]).toEqual(fetchDatafilesFailure('Test error message'));

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchDatafileCountRequest and fetchDatafileCountSuccess actions upon successful fetchDatafileCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 5,
      })
    );

    const asyncAction = fetchDatafileCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));
    expect(actions[1]).toEqual(fetchDatafileCountSuccess(5, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ DATASET_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith('/datafiles/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('fetchDatafileCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 3,
      })
    );

    const asyncAction = fetchDatafileCount(1);
    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        filters: { column1: '1', column2: '2' },
      },
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));

    expect(actions[1]).toEqual(fetchDatafileCountSuccess(3, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ DATASET_ID: { eq: 1 } }));

    expect(axios.get).toHaveBeenCalledWith('/datafiles/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchDatafileCountRequest and fetchDatafileCountFailure actions upon unsuccessful fetchDatafileCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatafileCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));
    expect(actions[1]).toEqual(
      fetchDatafileCountFailure('Test error message', 1)
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches fetchDatasetDatafilesCountRequest and fetchDatasetDatafilesCountSuccess actions upon successful fetchDatasetDatafilesCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchDatasetDatafilesCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetDatafilesCountRequest(1));
    expect(actions[1]).toEqual(fetchDatasetDatafilesCountSuccess(1, 2, 1));

    expect(axios.get).toHaveBeenCalledWith(
      '/datafiles/count',
      expect.objectContaining({
        params: {
          where: { DATASET_ID: { eq: 1 } },
        },
      })
    );
  });

  it('dispatches fetchDatasetDatafilesCountRequest and fetchDatasetDatafilesCountSuccess actions upon existing datasetCache and successful fetchDatasetDatafilesCount action', async () => {
    const asyncAction = fetchDatasetDatafilesCount(1);

    // Set up state to be used within fetchDatasetDatafilesCountSuccess with the dataset cache.
    const getState = (): Partial<StateType> => ({
      dgcommon: {
        ...initialState,
        data: mockData,
        datasetCache: mockDatasetCache,
      },
    });

    await asyncAction(dispatch, getState, null);

    // We expect two actions to be dispatched; fetchDatasetDatafilesCountRequest and fetchDatasetDatafilesCountSuccess.
    // We do not want axio.get to have been called during the action as well.
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual(fetchDatasetDatafilesCountRequest(1));
    expect(actions[1]).toEqual(fetchDatasetDatafilesCountSuccess(1, 2, 1));
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('dispatches fetchDatasetDatafilesCountRequest and fetchDatasetDatafilesCountFailure actions upon unsuccessful fetchDatasetDatafilesCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetDatafilesCount(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetDatafilesCountRequest(1));
    expect(actions[1]).toEqual(
      fetchDatasetDatafilesCountFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });

  it('dispatches downloadDatafileRequest and clicks on IDS link upon downloadDatafile action', async () => {
    jest.spyOn(document, 'createElement');
    jest.spyOn(document.body, 'appendChild');

    const asyncAction = downloadDatafile(1, 'test.txt');
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(downloadDatafileRequest(1));

    expect(document.createElement).toHaveBeenCalledWith('a');
    let link = document.createElement('a');
    link.href = `/getData?sessionId=${null}&datafileIds=${1}&compress=${false}&outname=${'test.txt'}`;
    link.target = '_blank';
    link.style.display = 'none';
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
  });

  it('dispatches fetchDatafileDetailsRequest and fetchDatafileDetailsSuccess actions upon successful fetchDatafileDetails action', async () => {
    const mockData: Datafile[] = [
      {
        ID: 1,
        NAME: 'Test 1',
        LOCATION: '/test1',
        FILESIZE: 1,
        MOD_TIME: '2019-06-10',
        CREATE_TIME: '2019-06-10',
        DATASET_ID: 1,
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchDatafileDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileDetailsRequest());
    expect(actions[1]).toEqual(fetchDatafileDetailsSuccess(mockData));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ ID: { eq: 1 } }));
    params.append(
      'include',
      JSON.stringify({ DATAFILEPARAMETER: 'PARAMETERTYPE' })
    );

    expect(axios.get).toHaveBeenCalledWith('/datafiles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchDatafileDetailsRequest and fetchDatafileDetailsFailure actions upon unsuccessful fetchDatafileDetails action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatafileDetails(1);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileDetailsRequest());
    expect(actions[1]).toEqual(
      fetchDatafileDetailsFailure('Test error message')
    );

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual('Test error message');
  });
});
