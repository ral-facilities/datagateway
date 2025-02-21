import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { type AxiosError } from 'axios';
import {
  LUCENE_ERROR_CODE,
  type LuceneError,
  type LuceneSearchParams,
  useLuceneSearchInfinite,
  useLuceneFacet,
} from '.';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import type { FiltersType } from '../app.types';
import { NotificationType } from '../state/actions/actions.types';
import type { DeepPartial } from 'redux';

jest.mock('../handleICATError');

describe('Lucene actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  describe('useLuceneSearchInfinite', () => {
    it('sends lucene search request with appropriate filters applied', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 1 }] },
      });

      const filters: FiltersType = {
        'dataset.type.name': ['dataset name'],
        'investigationInstrument.instrument.name': ['instrument name'],
      };
      const luceneParams: LuceneSearchParams = {
        searchText: 'test',
        startDate: null,
        endDate: null,
        facets: [{ target: 'Dataset' }],
        sort: { size: 'desc' },
      };

      const { result } = renderHook(
        () => useLuceneSearchInfinite('Dataset', luceneParams, filters),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Dataset',
          filter: {
            'dataset.type.name': ['dataset name'],
            'investigationInstrument.instrument.name': ['instrument name'],
          },
          text: 'test',
          facets: [{ target: 'Dataset' }],
        })
      );
      params.append(
        'sort',
        JSON.stringify({
          size: 'desc',
        })
      );
      params.append('minCount', '10');
      params.append('maxCount', '100');
      params.append('restrict', 'false');

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/icat/search/documents',
        {
          params,
        }
      );
      expect(result.current.data?.pages[0]).toEqual({ results: [{ id: 1 }] });
    });

    it('sends lucene search request with start date bound applied', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 1 }] },
      });

      const luceneSearchParams: LuceneSearchParams = {
        searchText: 'test',
        startDate: new Date(2000, 0, 1),
        endDate: null,
        maxCount: 300,
      };

      const { result } = renderHook(
        () => useLuceneSearchInfinite('Datafile', luceneSearchParams, {}),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Datafile',
          lower: '200001010000',
          upper: '9000012312359',
          text: 'test',
        })
      );
      params.append('minCount', '10');
      params.append('maxCount', '300');
      params.append('restrict', 'false');

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/icat/search/documents',
        {
          params,
        }
      );
      expect(result.current.data?.pages[0]).toEqual({ results: [{ id: 1 }] });
    });

    it('sends lucene search request with end date bound applied', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 1 }] },
      });

      const luceneSearchParams: LuceneSearchParams = {
        searchText: 'test',
        startDate: null,
        endDate: new Date(2020, 11, 31),
        maxCount: 300,
      };

      const { result } = renderHook(
        () => useLuceneSearchInfinite('Datafile', luceneSearchParams, {}),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Datafile',
          lower: '0000001010000',
          upper: '202012312359',
          text: 'test',
        })
      );
      params.append('minCount', '10');
      params.append('maxCount', '300');
      params.append('restrict', 'false');

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/icat/search/documents',
        {
          params,
        }
      );
      expect(result.current.data?.pages[0]).toEqual({ results: [{ id: 1 }] });
    });

    it('ignores empty search text when building lucene search request', async () => {
      const luceneSearchParams: LuceneSearchParams = {
        searchText: '',
        startDate: null,
        endDate: new Date(2020, 11, 31),
        maxCount: 300,
      };

      const { result } = renderHook(
        () => useLuceneSearchInfinite('Investigation', luceneSearchParams, {}),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Investigation',
          lower: '0000001010000',
          upper: '202012312359',
        })
      );
      params.append('minCount', '10');
      params.append('maxCount', '300');
      params.append('restrict', 'false');

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/icat/search/documents',
        {
          params,
        }
      );
    });

    it('fetches next page when one is available when getNextPage is called', async () => {
      const luceneSearchParams: LuceneSearchParams = {
        searchText: '',
        startDate: null,
        endDate: null,
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          results: [],
          search_after: { doc: 5 },
        },
      });

      const { result } = renderHook(
        () => useLuceneSearchInfinite('Investigation', luceneSearchParams, {}),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      await act(async () => {
        await result.current.fetchNextPage();
      });

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Investigation',
        })
      );
      params.append('search_after', JSON.stringify({ doc: 5 }));
      params.append('minCount', '10');
      params.append('maxCount', '100');
      params.append('restrict', 'false');

      // second call is the fetch next page call
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/icat/search/documents',
        {
          params,
        }
      );
    });

    describe('sends a special notification', () => {
      const ogDispatchEvent = document.dispatchEvent;
      const mockDispatchEvent = jest.fn();

      beforeEach(() => {
        document.dispatchEvent = mockDispatchEvent;
      });

      afterEach(() => {
        mockDispatchEvent.mockClear();
      });

      afterAll(() => {
        document.dispatchEvent = ogDispatchEvent;
      });

      it('on search timeout error', async () => {
        const luceneSearchParams: LuceneSearchParams = {
          searchText: '*',
          startDate: null,
          endDate: new Date(2020, 11, 31),
          maxCount: 300,
        };

        (axios.get as jest.Mock).mockRejectedValue({
          code: 500,
          response: {
            data: {
              code: LUCENE_ERROR_CODE.internal,
              message: 'Search cancelled for exceeding 5 seconds',
            },
          },
        });

        const { result } = renderHook(
          () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
        const callArgs = mockDispatchEvent.mock.calls[0];
        expect((callArgs[0] as CustomEvent).detail.type).toEqual(
          NotificationType
        );
        expect((callArgs[0] as CustomEvent).detail.payload).toEqual({
          severity: 'error',
          message: `Unable to complete requested search in under 5 seconds. To ensure searches complete quickly, please try:
- Only searching "my data"
- Only searching the type of entity you need results for
- Using fewer wildcard characters in the search term(s)
- Making the search term(s) more specific
- Using the default relevancy based sorting`,
        });
      });

      it('on bad search text error', async () => {
        const luceneSearchParams: LuceneSearchParams = {
          searchText: '*',
          startDate: null,
          endDate: new Date(2020, 11, 31),
          maxCount: 300,
        };

        (axios.get as jest.Mock).mockRejectedValue({
          code: 500,
          response: {
            data: {
              code: LUCENE_ERROR_CODE.badParameter,
              message: 'bad search query',
            },
          },
        });

        const { result } = renderHook(
          () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
        const callArgs = mockDispatchEvent.mock.calls[0];
        expect((callArgs[0] as CustomEvent).detail.type).toEqual(
          NotificationType
        );
        expect((callArgs[0] as CustomEvent).detail.payload).toEqual({
          severity: 'error',
          message: `Syntax error found in the provided search text. Please refer to the full help for search syntax, or try:
- Replacing \\ characters with spaces (unless being used to escape another special character)
- Surrounding text containing other special characters with double quotes`,
        });
      });
    });

    describe('handles error generically', () => {
      it('for errors without a response', async () => {
        const luceneSearchParams: LuceneSearchParams = {
          searchText: '*',
          startDate: null,
          endDate: new Date(2020, 11, 31),
          maxCount: 300,
        };

        const axiosError: DeepPartial<AxiosError<LuceneError>> = {
          code: '500',
        };

        (axios.get as jest.Mock).mockRejectedValue(axiosError);

        const { result } = renderHook(
          () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(axiosError);
      });

      it('for other types of errors', async () => {
        const luceneSearchParams: LuceneSearchParams = {
          searchText: '*',
          startDate: null,
          endDate: new Date(2020, 11, 31),
          maxCount: 300,
        };

        const axiosError: DeepPartial<AxiosError<LuceneError>> = {
          code: '500',
          response: {
            data: {
              code: 'SESSION',
              message: 'some random message',
            },
          },
        };

        (axios.get as jest.Mock).mockRejectedValue(axiosError);

        const { result } = renderHook(
          () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(axiosError);
      });

      it('for other internal errors', async () => {
        const luceneSearchParams: LuceneSearchParams = {
          searchText: '*',
          startDate: null,
          endDate: new Date(2020, 11, 31),
          maxCount: 300,
        };

        const axiosError: DeepPartial<AxiosError<LuceneError>> = {
          code: '500',
          response: {
            data: {
              code: LUCENE_ERROR_CODE.internal,
              message: 'some other internal error',
            },
          },
        };

        (axios.get as jest.Mock).mockRejectedValue(axiosError);

        const { result } = renderHook(
          () => useLuceneSearchInfinite('Dataset', luceneSearchParams, {}),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(axiosError);
      });
    });
  });

  describe('useLuceneFacet', () => {
    it('sends lucene search request with appropriate filters applied', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 1 }] },
      });

      const filters: FiltersType = {
        'investigation.type.name': ['investigation name'],
      };
      const facets = [{ target: 'test_target' }];

      const { result } = renderHook(
        () =>
          useLuceneFacet('Investigation', facets, filters, {
            select: (data) => data.results,
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append(
        'query',
        JSON.stringify({
          target: 'Investigation',
          facets,
          filter: filters,
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/icat/facet/documents',
        {
          params,
        }
      );
      expect(result.current.data).toEqual([{ id: 1 }]);
    });

    it('calls handleICAT error on error', async () => {
      (axios.get as jest.Mock).mockRejectedValue('error');

      const { result } = renderHook(() => useLuceneFacet('Dataset', [], {}), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith('error');
    });
  });
});
