import { ActionType, StateType } from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
} from './actions.types';
import { Filter, Order } from 'datagateway-common';

export const getApiFilter = (
  getState: () => StateType
): {
  order?: string | string[];
  where?: { [column: string]: Filter };
} => {
  const sort = getState().dgtable.sort;
  const filters = getState().dgtable.filters;

  let apiFilter: {
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

    apiFilter.order = orderFilter;
  }
  if (Object.keys(filters).length !== 0) {
    apiFilter.where = filters;
  }

  return apiFilter;
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
