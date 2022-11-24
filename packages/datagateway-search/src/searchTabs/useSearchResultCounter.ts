import { DatasearchType, SearchResponse } from 'datagateway-common';
import React from 'react';

/**
 * Stores number of search results for each entity type.
 */
type SearchResultCounts = {
  [TType in DatasearchType]?: SearchResultCount;
};

interface SearchResultCount {
  type: DatasearchType;
  count: number;
  hasMore: boolean;
}

/**
 * Dispatch this action to notify {@link SearchTabs} of the current count of
 * the search results of the given {@link DatasearchType}.
 */
interface UpdateSearchResultCountAction {
  type: 'UPDATE_SEARCH_RESULT_COUNT';
  payload: SearchResultCount;
}

/**
 * Dispatch this action to notify {@link SearchTabs} to reset the search results
 * of the given {@link DatasearchType}.
 * {@link SearchTabs} will forget the current count and will display its count as unknown.
 */
interface ResetSearchResultCountAction {
  type: 'RESET_SEARCH_RESULT_COUNT';
  payload: DatasearchType;
}

type SearchResultCountAction =
  | UpdateSearchResultCountAction
  | ResetSearchResultCountAction;

/**
 * Handles actions dispatched by search tables.
 */
function searchResultCountsReducer(
  state: SearchResultCounts,
  action: SearchResultCountAction
): SearchResultCounts {
  switch (action.type) {
    case 'RESET_SEARCH_RESULT_COUNT':
      // make a copy of the current state
      // and remove the search result count of the given data search type.
      const next: SearchResultCounts = { ...state };
      delete next[action.payload];
      return next;

    case 'UPDATE_SEARCH_RESULT_COUNT':
      return {
        ...state,
        [action.payload.type]: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Context for dispatching search result count after they are available.
 * Default value is the identity function (I don't want to deal with null values).
 */
const SearchResultCountDispatch = React.createContext<
  React.Dispatch<SearchResultCountAction>
>((_) => _);

/**
 * This hook stores the search result counts of various data search type.
 * since only the actual data views (e.g. search tables) are responsible for fetching the actual search result
 * for its own data search type (e.g. investigation search table fetches investigation search results)
 * only they know the number of search results returned.
 *
 * since {@link SearchTabs} is responsible for displaying the search result counts next
 * to each tab, it needs to obtain the counts from the data views.
 * this is done by passing down the dispatch function returned by this hook
 * that data views can call to pass the correct search result count when it is available.
 * data views can also reset the count through the dispatch function.
 * doing so erases the current search result count, and it will be shown as unknown to the users.
 * for example, they can reset the count when they are fetching fresh data.
 *
 * the dispatch function is available through {@link SearchResultCountDispatch}.
 */
function useSearchResultCounts(): [
  SearchResultCounts,
  React.Dispatch<SearchResultCountAction>
] {
  return React.useReducer(searchResultCountsReducer, {});
}

/**
 * This hook counts the number of search results in the given
 * array of SearchResponses, and then dispatches it to SearchTabs.
 */
function useSearchResultCounter({
  dataSearchType,
  searchResponses,
  isFetching,
  hasMore,
}: {
  dataSearchType: DatasearchType;
  searchResponses?: SearchResponse[];
  isFetching?: boolean;
  hasMore?: boolean;
}): void {
  const dispatchSearchResultCount = React.useContext(SearchResultCountDispatch);

  React.useEffect(() => {
    if (searchResponses) {
      const searchResultCount = searchResponses.reduce(
        (count, page) => count + (page.results?.length ?? 0),
        0
      );
      dispatchSearchResultCount({
        type: 'UPDATE_SEARCH_RESULT_COUNT',
        payload: {
          type: dataSearchType,
          count: searchResultCount,
          hasMore: hasMore ?? false,
        },
      });
    }
  }, [
    searchResponses,
    dispatchSearchResultCount,
    hasMore,
    dataSearchType,
    // count should be re-calculated whenever fetch status changes
    // in case the same search responses are given after fetching
    isFetching,
  ]);

  React.useEffect(() => {
    if (isFetching) {
      dispatchSearchResultCount({
        type: 'RESET_SEARCH_RESULT_COUNT',
        payload: dataSearchType,
      });
    }
  }, [dataSearchType, dispatchSearchResultCount, isFetching]);
}

export {
  useSearchResultCounts,
  useSearchResultCounter,
  SearchResultCountDispatch,
};
export type {
  SearchResultCount,
  SearchResultCountAction,
  UpdateSearchResultCountAction,
  ResetSearchResultCountAction,
};
