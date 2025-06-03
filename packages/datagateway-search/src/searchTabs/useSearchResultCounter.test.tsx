import * as React from 'react';
import {
  type SearchResultCountAction,
  SearchResultCountDispatch,
  useSearchResultCounter,
} from './useSearchResultCounter';
import { renderHook, waitFor } from '@testing-library/react';
import { mockSearchResponses } from '../testData';

describe('useSearchResultCounter', () => {
  const mockDispatch: jest.MockedFn<React.Dispatch<SearchResultCountAction>> =
    jest.fn();

  function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return (
      <SearchResultCountDispatch.Provider value={mockDispatch}>
        {children}
      </SearchResultCountDispatch.Provider>
    );
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('dispatches search result count for the given search responses', () => {
    renderHook(
      () =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          searchResponses: mockSearchResponses,
          isFetching: false,
          hasMore: false,
        }),
      {
        wrapper: Wrapper,
      }
    );

    waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: false,
        },
      });
    });
  });

  it('does not dispatch anything if search responses are undefined', () => {
    renderHook(
      () =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          isFetching: false,
          hasMore: false,
        }),
      {
        wrapper: Wrapper,
      }
    );

    expect(mockDispatch).not.toBeCalled();
  });

  it('resets search result count when isFetching is set to true', async () => {
    const { rerender } = renderHook(
      (props: Partial<Parameters<typeof useSearchResultCounter>[0]>) =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          searchResponses: mockSearchResponses,
          isFetching: false,
          hasMore: false,
          ...props,
        }),
      {
        wrapper: Wrapper,
      }
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: false,
        },
      });
    });

    rerender({
      isFetching: true,
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'RESET_SEARCH_RESULT_COUNT',
        payload: 'Investigation',
      });
    });
  });

  it('dispatches hasMore if set to true', () => {
    renderHook(
      () =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          searchResponses: mockSearchResponses,
          isFetching: false,
          hasMore: true,
        }),
      { wrapper: Wrapper }
    );

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: true,
        },
      });
    });
  });

  it('dispatches hasMore as false if hasMore not given', () => {
    renderHook(
      () =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          searchResponses: mockSearchResponses,
          isFetching: false,
        }),
      { wrapper: Wrapper }
    );

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: false,
        },
      });
    });
  });

  it('dispatches the same search result count after fetching and the same search responses are given', async () => {
    const { rerender } = renderHook(
      (props: Partial<Parameters<typeof useSearchResultCounter>[0]>) =>
        useSearchResultCounter({
          dataSearchType: 'Investigation',
          searchResponses: mockSearchResponses,
          isFetching: false,
          hasMore: false,
          ...props,
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: false,
        },
      });
    });

    rerender({ isFetching: true });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'RESET_SEARCH_RESULT_COUNT',
        payload: 'Investigation',
      });
    });

    rerender({
      isFetching: false,
      searchResponses: mockSearchResponses,
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: 'Investigation',
          count: 3,
          hasMore: false,
        },
      });
    });
  });
});
