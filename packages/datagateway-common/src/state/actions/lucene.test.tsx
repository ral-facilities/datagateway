import axios from 'axios';
import handleICATError from '../../handleICATError';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import {
  fetchLuceneIds,
  fetchLuceneIdsFailure,
  fetchLuceneIdsRequest,
  fetchLuceneIdsSuccess,
} from './lucene';

jest.mock('../../handleICATError');

describe('Lucene actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    resetActions();
  });

  it('dispatches fetchLuceneIdsRequest and fetchLuceneIdsSuccess actions upon successful fetchLuceneIds action with defaults', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ id: 1 }],
      })
    );

    const luceneSearchParams = {
      searchText: '',
      startDate: null,
      endDate: null,
    };
    const asyncAction = fetchLuceneIds('Datafile', luceneSearchParams);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchLuceneIdsRequest(1));
    expect(actions[1]).toEqual(fetchLuceneIdsSuccess([1], 1));

    const params = {
      sessionId: null,
      query: {
        target: 'Datafile',
        lower: '0000001010000',
        upper: '9000012312359',
      },
      maxCount: 300,
    };
    expect(axios.get).toHaveBeenCalledWith('/icat/lucene/data', {
      params: params,
    });
  });

  it('dispatches fetchLuceneIdsRequest and fetchLuceneIdsSuccess actions upon successful fetchLuceneIds action with arguments', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ id: 1 }],
      })
    );

    const luceneSearchParams = {
      searchText: 'test',
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2020, 11, 31),
      maxCount: 100,
    };
    const asyncAction = fetchLuceneIds('Datafile', luceneSearchParams);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchLuceneIdsRequest(1));
    expect(actions[1]).toEqual(fetchLuceneIdsSuccess([1], 1));

    const params = {
      sessionId: null,
      query: {
        target: 'Datafile',
        text: 'test',
        lower: '200001010000',
        upper: '202012312359',
      },
      maxCount: 100,
    };
    expect(axios.get).toHaveBeenCalledWith('/icat/lucene/data', {
      params: params,
    });
  });

  it('dispatches fetchLuceneIdsRequest and fetchLuceneIdsFailure actions upon unsuccessful fetchLuceneIds action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const luceneSearchParams = {
      searchText: '',
      startDate: null,
      endDate: null,
    };
    const asyncAction = fetchLuceneIds('Datafile', luceneSearchParams);
    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchLuceneIdsRequest(1));
    expect(actions[1]).toEqual(fetchLuceneIdsFailure('Test error message'));

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });
});
