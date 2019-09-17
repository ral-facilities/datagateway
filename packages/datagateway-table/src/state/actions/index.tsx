import { ActionType, StateType } from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
} from './actions.types';
import { Filter, Order } from 'datagateway-common';

export const getApiFilter = (getState: () => StateType): URLSearchParams => {
  const sort = getState().dgtable.sort;
  const filters = getState().dgtable.filters;

  let searchParams = new URLSearchParams();

  for (let [key, value] of Object.entries(sort)) {
    searchParams.append('order', JSON.stringify(`${key} ${value}`));
  }

  for (let [key, value] of Object.entries(filters)) {
    searchParams.append('where', JSON.stringify({ [key]: { like: value } }));
  }

  return searchParams;
};

export * from './investigations';
export * from './datasets';
export * from './datafiles';
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
