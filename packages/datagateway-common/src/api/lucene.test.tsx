import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { LuceneSearchParams, useLuceneSearchInfinite } from '.';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import { FiltersType } from '../app.types';

jest.mock('../handleICATError');

describe('Lucene actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  it('sends lucene search request with appropriate filters applied', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const filters: FiltersType = {
      'investigation.type.name': ['investigation name'],
      'dataset.type.name': ['dataset name'],
    };
    const luceneParams: LuceneSearchParams = {
      searchText: 'test',
      startDate: null,
      endDate: null,
    };

    const { result, waitFor } = renderHook(
      () => useLuceneSearchInfinite('Investigation', luceneParams, filters),
      { wrapper: createReactQueryWrapper() }
    );

    await waitFor(() => result.current.isSuccess);

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          sessionId: null,
          query: {
            target: 'Investigation',
            text: 'test',
            filter: {
              'investigation.type.name': ['investigation name'],
            },
          },
          maxCount: 100,
          minCount: 10,
          restrict: false,
          search_after: '',
          sort: '',
        },
      }
    );
    expect(result.current.data?.pages[0]).toEqual([{ id: 1 }]);
  });

  it('sends lucene search request with start date bound applied', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const luceneSearchParams: LuceneSearchParams = {
      searchText: 'test',
      startDate: new Date(2000, 0, 1),
      endDate: null,
      maxCount: 300,
    };

    const { result, waitFor } = renderHook(
      () => useLuceneSearchInfinite('Datafile', luceneSearchParams, {}),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    await waitFor(() => result.current.isSuccess);

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          sessionId: null,
          query: {
            target: 'Datafile',
            text: 'test',
            lower: '200001010000',
            upper: '9000012312359',
          },
          maxCount: 300,
          minCount: 10,
          restrict: false,
          search_after: '',
          sort: '',
        },
      }
    );
    expect(result.current.data?.pages[0]).toEqual([{ id: 1 }]);
  });

  it('sends lucene search request with end date bound applied', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const luceneSearchParams: LuceneSearchParams = {
      searchText: 'test',
      startDate: null,
      endDate: new Date(2020, 11, 31),
      maxCount: 300,
    };

    const { result, waitFor } = renderHook(
      () => useLuceneSearchInfinite('Datafile', luceneSearchParams, {}),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    await waitFor(() => result.current.isSuccess);

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          sessionId: null,
          query: {
            target: 'Datafile',
            text: 'test',
            lower: '0000001010000',
            upper: '202012312359',
          },
          maxCount: 300,
          minCount: 10,
          restrict: false,
          search_after: '',
          sort: '',
        },
      }
    );
    expect(result.current.data?.pages[0]).toEqual([{ id: 1 }]);
  });

  it('ignores empty search text when building lucene search request', async () => {
    const luceneSearchParams: LuceneSearchParams = {
      searchText: '',
      startDate: null,
      endDate: new Date(2020, 11, 31),
      maxCount: 300,
    };

    const { result, waitFor } = renderHook(
      () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
      {
        wrapper: createReactQueryWrapper(),
      }
    );

    await waitFor(() => result.current.isSuccess);

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          sessionId: null,
          query: {
            target: 'Dataset',
            lower: '0000001010000',
            upper: '202012312359',
          },
          maxCount: 300,
          minCount: 10,
          restrict: false,
          search_after: '',
          sort: '',
        },
      }
    );
  });
});
