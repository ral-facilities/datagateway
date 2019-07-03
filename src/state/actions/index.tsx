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
  order?: string | string[];
  where?: { [column: string]: Filter };
} => {
  const sort = getState().dgtable.sort;
  const filters = getState().dgtable.filters;

  let filter: {
    order?: string | string[];
    where?: { [column: string]: Filter };
  } = {};

  const sorts = Object.entries(sort);
  if (sorts.length !== 0) {
    let orderFilter: string | string[];
    if (sorts.length === 1) {
      orderFilter = `${sorts[0][0]} ${sorts[0][1]}`;
    } else {
      orderFilter = [];
      for (const [column, order] of sorts) {
        orderFilter.push(`${column} ${order}`);
      }
    }

    filter.order = orderFilter;
  }
  if (Object.keys(filters).length !== 0) {
    filter.where = filters;
  }

  return filter;
};

export * from './investigations';
export * from './datasets';
export * from './datafiles';

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
