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
import { Datafile } from '../../app.types';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('Datafile actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);
  const mockData: Datafile[] = [
    {
      id: 1,
      name: 'Test 1',
      location: '/test1',
      fileSize: 1,
      modTime: '2019-06-10',
      createTime: '2019-06-10',
      dataset: 1,
    },
    {
      id: 2,
      name: 'Test 2',
      location: '/test2',
      fileSize: 2,
      modTime: '2019-06-10',
      createTime: '2019-06-10',
      dataset: 1,
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
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchDatafilesRequest and fetchDatafilesSuccess actions upon successful fetchDatafiles action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchDatafiles({
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ dataset: { eq: 1 } }),
        },
      ],
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));
    expect(actions[1]).toEqual(fetchDatafilesSuccess(mockData, 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ dataset: { eq: 1 } }));

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

    const asyncAction = fetchDatafiles({
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ dataset: { eq: 1 } }),
        },
      ],
    });
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

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));

    expect(actions[1]).toEqual(fetchDatafilesSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ dataset: { eq: 1 } }));

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

    const asyncAction = fetchDatafiles();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafilesRequest(1));
    expect(actions[1]).toEqual(fetchDatafilesFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('dispatches fetchDatafileCountRequest and fetchDatafileCountSuccess actions upon successful fetchDatafileCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 5,
      })
    );

    const asyncAction = fetchDatafileCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ dataset: { eq: 1 } }),
      },
    ]);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));
    expect(actions[1]).toEqual(fetchDatafileCountSuccess(5, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ dataset: { eq: 1 } }));

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

    const asyncAction = fetchDatafileCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ dataset: { eq: 1 } }),
      },
    ]);
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

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));

    expect(actions[1]).toEqual(fetchDatafileCountSuccess(3, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));
    params.append('where', JSON.stringify({ dataset: { eq: 1 } }));

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

    const asyncAction = fetchDatafileCount();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatafileCountRequest(1));
    expect(actions[1]).toEqual(
      fetchDatafileCountFailure('Test error message', 1)
    );

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
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
          where: { 'dataset.id': { eq: 1 } },
          include: 'dataset',
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

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith(
      { message: 'Test error message' },
      false
    );
  });

  it('dispatches downloadDatafileRequest and clicks on IDS link upon downloadDatafile action', async () => {
    jest.spyOn(document, 'createElement');
    jest.spyOn(document.body, 'appendChild');

    const asyncAction = downloadDatafile(1, 'test.txt');
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(downloadDatafileRequest(1));

    expect(document.createElement).toHaveBeenCalledWith('a');
    const link = document.createElement('a');
    link.href = `/getData?sessionId=${null}&datafileIds=${1}&compress=${false}&outname=${'test.txt'}`;
    link.target = '_blank';
    link.style.display = 'none';
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
  });

  it('dispatches fetchDatafileDetailsRequest and fetchDatafileDetailsSuccess actions upon successful fetchDatafileDetails action', async () => {
    const mockData: Datafile[] = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-06-10',
        createTime: '2019-06-10',
        dataset: 1,
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
    params.append('where', JSON.stringify({ id: { eq: 1 } }));
    params.append('include', JSON.stringify({ parameters: 'type' }));

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

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchDatafiles applies skip and limit when specified via optional parameters', async () => {
    const asyncAction = fetchDatafiles({
      offsetParams: { startIndex: 0, stopIndex: 49 },
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ dataset: { eq: 1 } }),
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
    params.append('where', JSON.stringify({ dataset: { eq: 1 } }));
    params.append('skip', JSON.stringify(0));
    params.append('limit', JSON.stringify(50));

    expect(axios.get).toHaveBeenCalledWith('/datafiles', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });
});
