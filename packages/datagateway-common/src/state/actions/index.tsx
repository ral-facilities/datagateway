import { StateType } from '../app.types';

export const getApiFilter = (getState: () => StateType): URLSearchParams => {
  const sort = getState().dgtable.sort;
  const filters = getState().dgtable.filters;

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
