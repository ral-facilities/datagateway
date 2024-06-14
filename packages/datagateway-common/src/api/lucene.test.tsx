import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { useLuceneSearch, useSemanticSearch } from '.';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import { SemanticSearchResults } from '../app.types';

jest.mock('../handleICATError');

describe('Lucene actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
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
      () => useLuceneSearch('Investigation', luceneSearchParams),
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
      query: JSON.stringify({
        target: 'Investigation',
      }),
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
      query: JSON.stringify({
        target: 'Datafile',
        lower: '200001010000',
        upper: '202012312359',
        text: 'test',
      }),
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

  it('sends axios request to fetch lucene search results once refetch function is called and returns successful response with only one date set', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const luceneSearchParams = {
      searchText: 'test',
      startDate: new Date(2000, 0, 1),
      endDate: null,
      maxCount: 100,
    };
    const startDateTest = renderHook(
      () => useLuceneSearch('Datafile', luceneSearchParams),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    expect(axios.get).not.toHaveBeenCalled();
    expect(startDateTest.result.current.isIdle).toBe(true);

    startDateTest.result.current.refetch();

    await startDateTest.waitFor(() => startDateTest.result.current.isSuccess);

    const params = {
      sessionId: null,
      query: JSON.stringify({
        target: 'Datafile',
        lower: '200001010000',
        upper: '9000012312359',
        text: 'test',
      }),
      maxCount: 100,
    };
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: params,
      }
    );
    expect(startDateTest.result.current.data).toEqual([1]);

    (axios.get as jest.Mock).mockClear();

    luceneSearchParams.endDate = new Date(2020, 11, 31);
    luceneSearchParams.startDate = null;

    const endDateTest = renderHook(
      () => useLuceneSearch('Datafile', luceneSearchParams),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    expect(axios.get).not.toHaveBeenCalled();
    expect(endDateTest.result.current.isIdle).toBe(true);

    endDateTest.result.current.refetch();

    await endDateTest.waitFor(() => endDateTest.result.current.isSuccess);

    params.query = JSON.parse(params.query);

    params.query.upper = '202012312359';
    params.query.lower = '0000001010000';

    params.query = JSON.stringify(params.query);

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: params,
      }
    );
    expect(endDateTest.result.current.data).toEqual([1]);
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

  describe('useSemanticSearch', () => {
    const mockSemanticSearchResults: SemanticSearchResults = [
      {
        score: 0.1,
        doc: {
          id: 1,
          visitId: '1',
          name: 'Mock investigation 1 name',
          title: 'Mock investigation 1',
          summary: 'Mock investigation 1 summary',
        },
      },
      {
        score: 0.2,
        doc: {
          id: 2,
          visitId: '2',
          name: 'Mock investigation 2 name',
          title: 'Mock investigation 2',
          summary: 'Mock investigation 2 summary',
        },
      },
      {
        score: 0.15,
        doc: {
          id: 3,
          visitId: '3',
          name: 'Mock investigation 3 name',
          title: 'Mock investigation 3',
          summary: 'Mock investigation 3 summary',
        },
      },
    ];

    it('performs semantic search based on the given query and returns the results sorted based on relevance from most to least relevant', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockSemanticSearchResults,
      });

      const { result, waitFor } = renderHook(
        () =>
          useSemanticSearch({
            query: 'Test query',
            enabled: true,
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual([
        {
          id: 2,
          visitId: '2',
          name: 'Mock investigation 2 name',
          title: 'Mock investigation 2',
          summary: 'Mock investigation 2 summary',
        },
        {
          id: 3,
          visitId: '3',
          name: 'Mock investigation 3 name',
          title: 'Mock investigation 3',
          summary: 'Mock investigation 3 summary',
        },
        {
          id: 1,
          visitId: '1',
          name: 'Mock investigation 1 name',
          title: 'Mock investigation 1',
          summary: 'Mock investigation 1 summary',
        },
      ]);
    });
  });
});
