import { ActionType, StateType } from '../app.types';
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
} from './actions.types';
import { Filter, Order } from '../../app.types';
import { Action } from 'redux';

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
