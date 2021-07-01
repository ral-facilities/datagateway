import {
  fetchStudies,
  fetchStudiesRequest,
  fetchStudiesSuccess,
  fetchStudiesFailure,
  fetchStudyCount,
  fetchStudyCountRequest,
  fetchStudyCountSuccess,
  fetchStudyCountFailure,
} from '.';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgcommon.reducer';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import { StudyInvestigation } from '../../app.types';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('Study actions', () => {
  beforeEach(() => {
    Date.now = jest.fn().mockImplementation(() => 1);
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchStudiesRequest and fetchStudiesSuccess actions upon successful fetchStudies action', async () => {
    const mockData: StudyInvestigation[] = [
      {
        id: 1,
        study: {
          id: 1,
          pid: 'doi 1',
          name: 'Test 1',
          modTime: '2000-01-01',
          createTime: '2000-01-01',
        },
      },
      {
        id: 2,
        study: {
          id: 2,
          pid: 'doi 2',
          name: 'Test 2',
          modTime: '2000-01-02',
          createTime: '2000-01-02',
        },
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchStudies({
      additionalFilters: [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { in: [1] },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify(['study', 'investigation']),
        },
      ],
    });
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchStudiesRequest(1));
    expect(actions[1]).toEqual(fetchStudiesSuccess(mockData, 1));
  });

  it('fetchStudies action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchStudies();
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

    expect(actions[0]).toEqual(fetchStudiesRequest(1));

    expect(actions[1]).toEqual(fetchStudiesSuccess([], 1));

    const params = new URLSearchParams();
    params.append('order', JSON.stringify('column1 desc'));
    params.append('order', JSON.stringify('id asc'));
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith('/studyinvestigations', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchStudiesRequest and fetchStudiesFailure actions upon unsuccessful fetchStudies action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchStudies();
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchStudiesRequest(1));
    expect(actions[1]).toEqual(fetchStudiesFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('dispatches fetchStudyCountRequest and fetchStudyCountSuccess actions upon successful fetchStudyCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchStudyCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchStudyCountRequest(1));
    expect(actions[1]).toEqual(fetchStudyCountSuccess(2, 1));
  });

  it('fetchStudyCount action applies filters to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const asyncAction = fetchStudyCount();
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

    expect(actions[0]).toEqual(fetchStudyCountRequest(1));

    expect(actions[1]).toEqual(fetchStudyCountSuccess(1, 1));

    const params = new URLSearchParams();
    params.append('where', JSON.stringify({ column1: { like: '1' } }));
    params.append('where', JSON.stringify({ column2: { like: '2' } }));

    expect(axios.get).toHaveBeenCalledWith('/studyinvestigations/count', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });

  it('dispatches fetchStudyCountRequest and fetchStudyCountFailure actions upon unsuccessful fetchStudyCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchStudyCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchStudyCountRequest(1));
    expect(actions[1]).toEqual(fetchStudyCountFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('fetchStudies applies skip and limit when specified via optional parameters', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchStudies({
      offsetParams: {
        startIndex: 0,
        stopIndex: 49,
      },
    });

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

    expect(axios.get).toHaveBeenCalledWith('/studyinvestigations', {
      headers: { Authorization: 'Bearer null' },
      params,
    });
  });
});
