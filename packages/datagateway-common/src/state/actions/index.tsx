import { push } from 'connected-react-router';
import { Action } from 'redux';
import { Entity, Filter, FiltersType, Order } from '../../app.types';
import {
  ActionType,
  QueryParams,
  StateType,
  ThunkResult,
  ViewsType,
} from '../app.types';
import {
  ClearDataType,
  ClearFiltersType,
  ClearTableType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  FilterTablePayload,
  FilterTableType,
  SaveViewPayload,
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
  UpdateSaveViewType,
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

// Get the nested value from an Entity object given a dataKey
// which drills specifies the property or array indexes.
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

export const clearFilters = (): Action => ({
  type: ClearFiltersType,
});

export const updateQueryParams = (
  queries: QueryParams
): ActionType<UpdateQueriesPayload> => ({
  type: UpdateQueriesType,
  payload: {
    queries,
  },
});

export const updateFilters = (
  filters: FiltersType
): ActionType<UpdateFiltersPayload> => ({
  type: UpdateFiltersType,
  payload: {
    filters,
  },
});

export const loadURLQuery = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Get the URLSearchParams object from the search query.
    const query = new URLSearchParams(getState().router.location.search);
    console.log('loading search: ', query.toString());

    // Get filters in URL.
    const page = query.get('page');
    const results = query.get('results');
    const filters = query.get('filters');

    // Parse filters in the query.
    let parsedFilters: FiltersType = {};
    let parsed = false;
    if (filters) {
      try {
        const fq: FiltersType = JSON.parse(filters);
        console.log('parsed filters: ', fq);

        // Create the entries for the filter.
        for (const [f, v] of Object.entries(fq)) {
          // Add only if there are filter items present.
          if (Array.isArray(v)) {
            if (v.length > 0) {
              parsedFilters[f] = v;
            }
          } else {
            parsedFilters[f] = v;
          }
          console.log(`Added ${f} with values: ${v}`);
        }

        // Ensure at least one filter has been added.
        if (Object.keys(parsedFilters).length > 0) {
          parsed = true;
        }
      } catch (e) {
        console.error('Filter queries provided in an incorrect format.');
      }
    }

    // Create the query parameters object.
    const params: QueryParams = {
      view: query.get('view') as ViewsType,
      page: page ? Number(page) : null,
      results: results ? Number(results) : null,
    };

    // Clear filters currently in state.
    dispatch(clearFilters());

    // Update with the new query parameters.
    dispatch(updateQueryParams(params));

    // Dispatch and update the filter object in state.
    console.log('Parsed filters: ', parsed);
    console.log(parsedFilters);
    if (parsed) {
      dispatch(updateFilters(parsedFilters));
    }
  };
};

// Get the current URL query parameters.
export const getURLQuery = (getState: () => StateType): URLSearchParams => {
  const query = getState().dgcommon.query;
  const filters = getState().dgcommon.filters;

  let queryParams = new URLSearchParams();

  // Loop and add all the query parameters which is in use.
  for (let [q, v] of Object.entries(query)) {
    if (v !== null && q !== 'filters') {
      console.log(`Adding ${q} with value: ${v}`);
      queryParams.append(q, v);
    }
  }

  // Add filters.
  for (const [f, v] of Object.entries(filters)) {
    if (Array.isArray(v)) {
      if (v.length > 0) {
        filters[f] = v;
      }
    } else {
      filters[f] = v;
    }
  }
  if (Object.keys(filters).length > 0) {
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
      if (!Array.isArray(filter)) {
        if ('startDate' in filter && filter.startDate) {
          searchParams.append(
            'where',
            JSON.stringify({
              [column]: { gte: `${filter.startDate} 00:00:00` },
            })
          );
        }
        if ('endDate' in filter && filter.endDate) {
          searchParams.append(
            'where',
            JSON.stringify({ [column]: { lte: `${filter.endDate} 23:59:59` } })
          );
        }
      } else {
        // If it is an array (strings or numbers) we use IN
        // and filter by what is in the array at the moment.
        searchParams.append(
          'where',
          JSON.stringify({ [column]: { in: filter } })
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

export const updateSaveView = (
  view: ViewsType
): ActionType<SaveViewPayload> => ({
  type: UpdateSaveViewType,
  payload: {
    view,
  },
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
  filterKey: string,
  data: Filter | null
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Make use of already present filterTable.
    dispatch(filterTable(filterKey, data));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const saveView = (view: ViewsType): ThunkResult<Promise<void>> => {
  return async dispatch => {
    // Save the current view.
    dispatch(updateSaveView(view));
  };
};
