import { ActionType, StateType, ViewsType, ThunkResult } from '../app.types';
import {
  URLs,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
  ClearTableType,
  UpdateViewType,
  UpdateViewPayload,
  UpdatePageType,
  UpdatePagePayload,
  // SaveQueriesPayload,
  // SaveQueriesType,
} from './actions.types';
import { Filter, Order } from '../../app.types';
import { Action } from 'redux';
import { push } from 'connected-react-router';

export * from './investigations';
export * from './datasets';
export * from './datafiles';
export * from './cart';
export * from './instruments';
export * from './facilityCycles';

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

// Get the current URL query parameters.
export const getURLQuery = (getState: () => StateType): URLSearchParams => {
  const query = getState().dgcommon.query;

  let queryParams = new URLSearchParams();

  // Loop and add all the query parameters which is in use.
  for (let [q, v] of Object.entries(query)) {
    console.log(`${q} with value: ${v}`);
    if (v !== null) queryParams.append(q, v);
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

export const pushPageView = (view: ViewsType): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(updateView(view));
    dispatch(push(`?${getURLQuery(getState).toString()}`));
  };
};

// export const saveQueries = (
//   queries: URLSearchParams | null
// ): ActionType<SaveQueriesPayload> => ({
//   type: SaveQueriesType,
//   payload: {
//     queries,
//   },
// });
