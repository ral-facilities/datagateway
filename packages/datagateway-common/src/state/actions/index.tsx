import { push } from 'connected-react-router';
import { Action } from 'redux';
import { Entity, Filter, Order } from '../../app.types';
import {
  ActionType,
  FiltersType,
  QueryParams,
  StateType,
  ThunkResult,
  ViewsType,
} from '../app.types';
import {
  ClearDataType,
  ClearTableType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  FilterTablePayload,
  FilterTableType,
  ResetQueryType,
  RestoreQueriesType,
  SaveQueriesPayload,
  SaveQueriesType,
  SortTablePayload,
  SortTableType,
  UpdateFiltersPayload,
  UpdateFiltersType,
  UpdatePagePayload,
  UpdatePageType,
  UpdateQueriesPayload,
  UpdateQueriesType,
  UpdateResultsPayload,
  UpdateResultsType,
  UpdateViewPayload,
  UpdateViewType,
  URLs,
} from './actions.types';

export * from './cart';
export * from './datafiles';
export * from './datasets';
export * from './facilityCycles';
export * from './instruments';
export * from './investigations';

// TODO: Get the nested value from an Entity object given a dataKey
//       which drills specifies the property or array indexes.
export const nestedValue = (data: Entity, dataKey: string): string => {
  const v = dataKey.split(/[.[\]]+/).reduce(function(prev, curr) {
    return prev ? prev[curr] : null;
  }, data);
  if (v) {
    return v.toString();
  } else {
    return '';
  }
};

export const sortTable = (
  column: string,
  order: Order | null
): ActionType<SortTablePayload> => ({
  type: SortTableType,
  payload: {
    column,
    order,
  },
});

export const filterTable = (
  column: string,
  filter: Filter | null
): ActionType<FilterTablePayload> => ({
  type: FilterTableType,
  payload: {
    column,
    filter,
  },
});

export const clearTable = (): Action => ({
  type: ClearTableType,
});

export const clearData = (): Action => ({
  type: ClearDataType,
});

export const updateQueryParams = (
  queries: QueryParams
): ActionType<UpdateQueriesPayload> => ({
  type: UpdateQueriesType,
  payload: {
    queries,
  },
});

interface FilterQuery {
  [filter: string]: string[];
}

export const loadURLQuery = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Get the URLSearchParams object from the search query.
    const query = new URLSearchParams(getState().router.location.search);
    console.log('loading search: ', query.toString());

    const page = query.get('page');
    const results = query.get('results');
    const filters = query.get('filters');

    // Parse filters in the query.
    let parsedFilters: FiltersType = {};
    let parsed = false;
    if (filters) {
      try {
        const fq: FilterQuery = JSON.parse(filters);
        console.log('parsed filters: ', fq);
        parsed = true;

        // Create the entries for the filter.
        for (const [f, v] of Object.entries(fq)) {
          console.log(`Adding ${f} with values: ${v}`);
          parsedFilters[f] = v.reduce(
            (o, value) => ({ ...o, [value]: true }),
            {}
          );
        }
      } catch (e) {
        // TODO: This will stop if the query is incorrect.
        console.error('Filter queries provided in an incorrect format.');
      }
    }

    // console.log(`load URL Query: ${page}`);
    const params: QueryParams = {
      view: query.get('view') as ViewsType,
      page: page ? Number(page) : null,
      results: results ? Number(results) : null,
      // TODO: Handle incorrect formats of filters - prevent filters being added if incorrect.
      filters: filters && parsed ? parsedFilters : null,
    };

    dispatch(updateQueryParams(params));
  };
};

// Get the current URL query parameters.
export const getURLQuery = (getState: () => StateType): URLSearchParams => {
  const query = getState().dgcommon.query;
  let queryParams = new URLSearchParams();

  // Loop and add all the query parameters which is in use.
  for (let [q, v] of Object.entries(query)) {
    if (v !== null && q !== 'filters') {
      console.log(`Adding ${q} with value: ${v}`);
      // TODO: Handle adding filters; we cannot get exact type filter.
      queryParams.append(q, v);
    }
  }

  // Add filters.
  if (query.filters) {
    const filters: FilterQuery = {};
    for (const [f, v] of Object.entries(query.filters)) {
      // TODO: Only map and add if selected is true.
      filters[f] = Object.entries(v)
        .filter(([, selected]) => selected)
        .map(([data]) => data);
    }
    console.log('Add filters: ', filters);
    queryParams.append('filters', JSON.stringify(filters));
  }

  console.log(`Final URLSearchParams - getURLQuery: ${queryParams.toString()}`);
  return queryParams;
};

// TODO: API filters should be part of the query parameters.
export const getApiFilter = (getState: () => StateType): URLSearchParams => {
  const sort = getState().dgcommon.sort;
  const filters = getState().dgcommon.filters;

  let searchParams = new URLSearchParams();

  for (let [key, value] of Object.entries(sort)) {
    searchParams.append('order', JSON.stringify(`${key} ${value}`));
  }

  // sort by ID first to guarantee order
  searchParams.append('order', JSON.stringify(`ID asc`));

  for (let [column, filter] of Object.entries(filters)) {
    if (typeof filter === 'object') {
      if ('startDate' in filter && filter.startDate) {
        searchParams.append(
          'where',
          JSON.stringify({ [column]: { gte: `${filter.startDate} 00:00:00` } })
        );
      }
      if ('endDate' in filter && filter.endDate) {
        searchParams.append(
          'where',
          JSON.stringify({ [column]: { lte: `${filter.endDate} 23:59:59` } })
        );
      }
    } else {
      searchParams.append(
        'where',
        JSON.stringify({ [column]: { like: filter } })
      );
    }
  }

  return searchParams;
};

export const loadFacilityName = (
  name: string
): ActionType<ConfigureFacilityNamePayload> => ({
  type: ConfigureFacilityNameType,
  payload: {
    facilityName: name,
  },
});

export const loadUrls = (urls: URLs): ActionType<ConfigureUrlsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
  },
});

export const updateView = (view: ViewsType): ActionType<UpdateViewPayload> => ({
  type: UpdateViewType,
  payload: {
    view,
  },
});

export const updatePage = (
  page: number | null
): ActionType<UpdatePagePayload> => ({
  type: UpdatePageType,
  payload: {
    page,
  },
});

export const updateResults = (
  results: number | null
): ActionType<UpdateResultsPayload> => ({
  type: UpdateResultsType,
  payload: {
    results,
  },
});

export const updateFilters = (
  filter: string,
  data: string,
  selected: boolean
): ActionType<UpdateFiltersPayload> => ({
  type: UpdateFiltersType,
  payload: {
    filter,
    data,
    selected,
  },
});

export const updateSaveQueries = (
  queries: QueryParams
): ActionType<SaveQueriesPayload> => ({
  type: SaveQueriesType,
  payload: {
    queries,
  },
});

export const restoreSaveQueries = (): Action => ({
  type: RestoreQueriesType,
});

export const resetQuery = (): Action => ({
  type: ResetQueryType,
});

export const pushPageView = (view: ViewsType): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateView(view));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const pushPageNum = (
  page: number | null
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updatePage(page));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const pushPageResults = (
  results: number | null
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateResults(results));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const pushPageFilter = (
  filter: string,
  data: string,
  selected: boolean
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateFilters(filter, data, selected));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const saveQueries = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Save the current queries.
    dispatch(updateSaveQueries(getState().dgcommon.query));

    // Reset the queries in state.
    dispatch(resetQuery());
  };
};

export const restoreQueries = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    // Update the current query params with the saved ones.
    dispatch(restoreSaveQueries());
    // dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};
