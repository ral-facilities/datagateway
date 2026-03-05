import { renderHook } from '@testing-library/react';
import * as React from 'react';
import type { MockedFunction } from 'vitest';
import { mockSearchResponses } from '../testData';
import {
  SearchResultCountDispatch,
  useSearchResultCounter,
  type SearchResultCountAction,
} from './useSearchResultCounter';

describe('useSearchResultCounter', () => {
  const mockDispatch: MockedFunction<React.Dispatch<SearchResultCountAction>> =
    vi.fn();

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
    vi.resetAllMocks();
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

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'UPDATE_SEARCH_RESULT_COUNT',
      payload: {
        type: 'Investigation',
        count: 3,
        hasMore: false,
      },
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

  it('resets search result count when isFetching is set to true', () => {
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

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'UPDATE_SEARCH_RESULT_COUNT',
      payload: {
        type: 'Investigation',
        count: 3,
        hasMore: false,
      },
    });

    rerender({
      isFetching: true,
    });

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'RESET_SEARCH_RESULT_COUNT',
      payload: 'Investigation',
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

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SEARCH_RESULT_COUNT',
      payload: {
        type: 'Investigation',
        count: 3,
        hasMore: true,
      },
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

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SEARCH_RESULT_COUNT',
      payload: {
        type: 'Investigation',
        count: 3,
        hasMore: false,
      },
    });
  });

  it('dispatches the same search result count after fetching and the same search responses are given', () => {
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

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'UPDATE_SEARCH_RESULT_COUNT',
      payload: {
        type: 'Investigation',
        count: 3,
        hasMore: false,
      },
    });

    rerender({ isFetching: true });

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'RESET_SEARCH_RESULT_COUNT',
      payload: 'Investigation',
    });

    rerender({
      isFetching: false,
      searchResponses: mockSearchResponses,
    });

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
