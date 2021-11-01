import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { useLuceneSearch } from '.';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';

jest.mock('../handleICATError');

describe('Lucene actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  it('sends axios request to fetch lucene search results once refetch function is called and returns successful response with default params', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const luceneSearchParams = {
      searchText: '',
      startDate: null,
      endDate: null,
    };
    const { result, waitFor } = renderHook(
      () => useLuceneSearch('Datafile', luceneSearchParams),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.refetch();

    await waitFor(() => result.current.isSuccess);

    const params = {
      sessionId: null,
      query: {
        target: 'Datafile',
      },
      maxCount: 300,
    };
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: params,
      }
    );
    expect(result.current.data).toEqual([1]);
  });

  it('sends axios request to fetch lucene search results once refetch function is called and returns successful response with arguments', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const luceneSearchParams = {
      searchText: 'test',
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2020, 11, 31),
      maxCount: 100,
    };
    const { result, waitFor } = renderHook(
      () => useLuceneSearch('Datafile', luceneSearchParams),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.refetch();

    await waitFor(() => result.current.isSuccess);

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
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: params,
      }
    );
    expect(result.current.data).toEqual([1]);
  });

  it('sends axios request to fetch lucene search results once refetch function is called and calls handleICATError on failure', async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      message: 'Test error message',
    });

    const luceneSearchParams = {
      searchText: '',
      startDate: null,
      endDate: null,
    };
    const { result, waitFor } = renderHook(
      () => useLuceneSearch('Datafile', luceneSearchParams),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.refetch();

    await waitFor(() => result.current.isError);

    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });
});
