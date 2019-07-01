import { ActionType, Order, Filter, StateType } from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
} from './actions.types';

export const getApiFilter = (
  getState: () => StateType
): {
  order?: string;
  where?: { [column: string]: Filter };
} => {
  const sort = getState().dgtable.sort;
  const filters = getState().dgtable.filters;

  const order = sort ? `${sort.column} ${sort.order}` : '';

  let filter: {
    order?: string;
    where?: { [column: string]: Filter };
  } = {};

  if (order) {
    filter.order = order;
  }
  if (filters) {
    filter.where = filters;
  }

  return filter;
};

export * from './investigations';
export * from './datasets';
export * from './datafiles';

export const sortTable = (
  column: string,
  order: Order
): ActionType<SortTablePayload> => ({
  type: SortTableType,
  payload: {
    column,
    order,
  },
});

export const filterTable = (
  column: string,
  filter: string
): ActionType<FilterTablePayload> => ({
  type: FilterTableType,
  payload: {
    column,
    filter,
  },
});
