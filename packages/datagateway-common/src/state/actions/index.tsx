import { push } from 'connected-react-router';
import { Action } from 'redux';
import { Entity, Filter, FiltersType, Order, SortType } from '../../app.types';
import {
  ActionType,
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
  UpdateSearchPayload,
  UpdateSearchType,
  UpdateSortPayload,
  UpdateSortType,
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
  const v = dataKey.split(/[.[\]]+/).reduce(function (prev, curr) {
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

export const updateSort = (sort: SortType): ActionType<UpdateSortPayload> => ({
  type: UpdateSortType,
  payload: {
    sort,
  },
});

export const clearTable = (): Action => ({
  type: ClearTableType,
});

export const clearData = (): Action => ({
  type: ClearDataType,
});

export const loadURLQuery = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Get the URLSearchParams object from the search query.
    const query = new URLSearchParams(getState().router.location.search);

    // Get filters in URL.
    const search = query.get('search');
    const page = query.get('page');
    const results = query.get('results');
    const filters = query.get('filters');
    const sort = query.get('sort');

    // Parse filters in the query.
    const parsedFilters: FiltersType = {};
    let isFiltersParsed = false;
    if (filters) {
      try {
        const fq: FiltersType = JSON.parse(filters);

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
        }

        // Ensure at least one filter has been added.
        if (Object.keys(parsedFilters).length > 0) {
          isFiltersParsed = true;
        }
      } catch (e) {
        console.error('Filter queries provided in an incorrect format.');
      }
    }

    const parsedSort: SortType = {};
    let isSortParsed = false;
    if (sort) {
      try {
        const sq: SortType = JSON.parse(sort);

        // Create the entries for sort.
        for (const [s, v] of Object.entries(sq)) {
          parsedSort[s] = v;
        }

        if (Object.keys(parsedSort).length > 0) {
          isSortParsed = true;
        }
      } catch (e) {
        console.error('Sort queries provided in an incorrect format.');
      }
    }

    // Create the query parameters object.
    const params: QueryParams = {
      view: query.get('view') as ViewsType,
      search: search ? search : null,
      page: page ? Number(page) : null,
      results: results ? Number(results) : null,
    };

    // Clear data in state already.
    dispatch(clearTable());

    // Update with the new query parameters.
    dispatch(updateQueryParams(params));

    // Dispatch and update the filter object in state.
    if (isFiltersParsed) {
      dispatch(updateFilters(parsedFilters));
    }

    // Dispatch and update sort object in state.
    if (isSortParsed) {
      dispatch(updateSort(parsedSort));
    }
  };
};

// Get the current URL query parameters.
export const getURLQuery = (getState: () => StateType): URLSearchParams => {
  const query = getState().dgcommon.query;
  const filters = getState().dgcommon.filters;
  const sort = getState().dgcommon.sort;

  const queryParams = new URLSearchParams();

  // Loop and add all the query parameters which is in use.
  for (const [q, v] of Object.entries(query)) {
    if (v !== null && q !== 'filters') {
      queryParams.append(q, v);
    }
  }

  // Add filters.
  const addFilters: FiltersType = {};
  for (const [f, v] of Object.entries(filters)) {
    if (Array.isArray(v)) {
      if (v.length > 0) {
        addFilters[f] = v;
      }
    } else {
      addFilters[f] = v;
    }
  }
  if (Object.keys(addFilters).length > 0) {
    queryParams.append('filters', JSON.stringify(addFilters));
  }

  // Add sort.
  const addSort: SortType = {};
  for (const [s, v] of Object.entries(sort)) {
    addSort[s] = v;
  }
  if (Object.keys(addSort).length > 0) {
    queryParams.append('sort', JSON.stringify(addSort));
  }

  return queryParams;
};

export const getApiFilter = (getState: () => StateType): URLSearchParams => {
  const sort = getState().dgcommon.sort;
  const filters = getState().dgcommon.filters;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(sort)) {
    searchParams.append('order', JSON.stringify(`${key} ${value}`));
  }

  // sort by ID first to guarantee order
  searchParams.append('order', JSON.stringify(`ID asc`));

  for (const [column, filter] of Object.entries(filters)) {
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

export const updateSearch = (
  search: string | null
): ActionType<UpdateSearchPayload> => ({
  type: UpdateSearchType,
  payload: {
    search,
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

export const pushPageView = (
  view: ViewsType,
  path: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateView(view));
    // Trim any trailing slashes which may prevent toggling between views.
    dispatch(
      push(path.replace(/\/$/, '') + `?${getURLQuery(getState).toString()}`)
    );
  };
};

export const pushPageSearch = (
  search: string | null
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateSearch(search));
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

export const pushPageSort = (
  sortKey: string,
  order: Order | null
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // Use sortTable present already.
    dispatch(sortTable(sortKey, order));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

export const saveView = (view: ViewsType): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    // Save the current view.
    dispatch(updateSaveView(view));
  };
};
