import React from 'react';
import axios, { AxiosError } from 'axios';
import { useHistory, useLocation } from 'react-router';
import {
  AdditionalFilters,
  FiltersType,
  SortType,
  Order,
  Filter,
  QueryParams,
  ViewsType,
  Entity,
} from '../app.types';
import { useQuery, UseQueryResult } from 'react-query';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

export * from './cart';
export * from './facilityCycles';
export * from './instruments';
export * from './investigations';
export * from './datafiles';
export * from './studies';
export * from './datasets';
export * from './lucene';

/**
 * Get the nested value from an Entity object given a dataKey
 * which drills specifies the property or array indexes.
 */
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

/**
 * Convert from search query string to QueryParam object
 */
export const parseSearchToQuery = (queryParams: string): QueryParams => {
  // Get the URLSearchParams object from the search query.
  const query = new URLSearchParams(queryParams);

  // Get filters in URL.
  const search = query.get('search');
  const page = query.get('page');
  const results = query.get('results');
  const filters = query.get('filters');
  const sort = query.get('sort');
  const view = query.get('view') as ViewsType;

  // Parse filters in the query.
  const parsedFilters: FiltersType = {};
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
    } catch (e) {
      console.error('Filter query provided in an incorrect format.');
    }
  }

  const parsedSort: SortType = {};
  if (sort) {
    try {
      const sq: SortType = JSON.parse(sort);

      // Create the entries for sort.
      for (const [s, v] of Object.entries(sq)) {
        parsedSort[s] = v;
      }
    } catch (e) {
      console.error('Sort query provided in an incorrect format.');
    }
  }

  // Create the query parameters object.
  const params: QueryParams = {
    view: view,
    search: search ? search : null,
    page: page ? Number(page) : null,
    results: results ? Number(results) : null,
    filters: parsedFilters,
    sort: parsedSort,
  };

  return params;
};

/**
 * Convert from QueryParam object to URLSearchParams
 */
export const parseQueryToSearch = (query: QueryParams): URLSearchParams => {
  const filters = query.filters;
  const sort = query.sort;

  const queryParams = new URLSearchParams();

  // Loop and add all the query parameters which is in use.
  for (const [q, v] of Object.entries(query)) {
    if (v !== null && q !== 'filters' && q !== 'sort') {
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

/**
 * Convert Sort and Filter types to datagateway-api compatible URLSearchParams
 */
export const getApiParams = (props: {
  sort: SortType;
  filters: FiltersType;
}): URLSearchParams => {
  const { sort, filters } = props;
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(sort)) {
    searchParams.append('order', JSON.stringify(`${key} ${value}`));
  }

  // sort by ID first to guarantee order
  searchParams.append('order', JSON.stringify(`id asc`));

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
        if ('type' in filter && filter.type) {
          if (filter.type === 'include') {
            searchParams.append(
              'where',
              JSON.stringify({ [column]: { like: filter.value } })
            );
          } else {
            searchParams.append(
              'where',
              JSON.stringify({ [column]: { nlike: filter.value } })
            );
          }
        }
      } else {
        // If it is an array (strings or numbers) we use IN
        // and filter by what is in the array at the moment.
        searchParams.append(
          'where',
          JSON.stringify({ [column]: { in: filter } })
        );
      }
    }
  }

  return searchParams;
};

export const usePushSort = (): ((
  sortKey: string,
  order: Order | null
) => void) => {
  const { push } = useHistory();
  return React.useCallback(
    (sortKey: string, order: Order | null): void => {
      let query = parseSearchToQuery(window.location.search);
      if (order !== null) {
        query = {
          ...query,
          sort: {
            ...query.sort,
            [sortKey]: order,
          },
        };
      } else {
        // if order is null, user no longer wants to sort by that column so remove column from sort state
        const { [sortKey]: order, ...rest } = query.sort;
        query = {
          ...query,
          sort: {
            ...rest,
          },
        };
      }
      push({ search: `?${parseQueryToSearch(query).toString()}` });
    },
    [push]
  );
};

export const usePushFilters = (): ((
  filterKey: string,
  filter: Filter | null
) => void) => {
  const { push } = useHistory();
  return React.useCallback(
    (filterKey: string, filter: Filter | null) => {
      let query = parseSearchToQuery(window.location.search);
      if (filter !== null) {
        // if given an defined filter, update the relevant column in the sort state
        query = {
          ...query,
          filters: {
            ...query.filters,
            [filterKey]: filter,
          },
        };
      } else {
        // if filter is null, user no longer wants to filter by that column so remove column from filter state
        const { [filterKey]: filter, ...rest } = query.filters;
        query = {
          ...query,
          filters: {
            ...rest,
          },
        };
      }
      push({ search: `?${parseQueryToSearch(query).toString()}` });
    },
    [push]
  );
};

export const usePushPage = (): ((page: number) => void) => {
  const { push } = useHistory();

  return React.useCallback(
    (page: number) => {
      const query = {
        ...parseSearchToQuery(window.location.search),
        page,
      };
      push(`?${parseQueryToSearch(query).toString()}`);
    },
    [push]
  );
};

export const usePushResults = (): ((results: number) => void) => {
  const { push } = useHistory();

  return React.useCallback(
    (results: number) => {
      const query = {
        ...parseSearchToQuery(window.location.search),
        results,
      };
      push(`?${parseQueryToSearch(query).toString()}`);
    },
    [push]
  );
};

export const usePushView = (): ((view: ViewsType) => void) => {
  const { push } = useHistory();

  return React.useCallback(
    (view: ViewsType) => {
      const query = {
        ...parseSearchToQuery(window.location.search),
        view,
      };
      push(`?${parseQueryToSearch(query).toString()}`);
    },
    [push]
  );
};

export const fetchIds = (
  apiUrl: string,
  entityType: 'investigation' | 'dataset' | 'datafile',
  filters: FiltersType,
  additionalFilters?: AdditionalFilters
): Promise<number[]> => {
  const params = getApiParams({ filters, sort: {} });

  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  const distinctFilterString = params.get('distinct');
  if (distinctFilterString) {
    const distinctFilter: string | string[] = JSON.parse(distinctFilterString);
    if (typeof distinctFilter === 'string') {
      params.set('distinct', JSON.stringify([distinctFilter, 'id']));
    } else {
      params.set('distinct', JSON.stringify([...distinctFilter, 'id']));
    }
  } else {
    params.set('distinct', JSON.stringify('id'));
  }
  console.log(params.toString());

  return axios
    .get<{ id: number }[]>(`${apiUrl}/${entityType}s`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data.map((x) => x.id);
    });
};

export const useIds = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  additionalFilters?: AdditionalFilters
): UseQueryResult<number[], Error> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const location = useLocation();
  const { filters } = parseSearchToQuery(location.search);

  return useQuery<
    number[],
    AxiosError,
    number[],
    [string, { filters: FiltersType }, AdditionalFilters?]
  >(
    [`${entityType}Ids`, { filters }, additionalFilters],
    (params) => {
      const { filters } = params.queryKey[1];
      return fetchIds(apiUrl, entityType, filters, additionalFilters);
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const fetchFilter = (
  apiUrl: string,
  entityType: 'investigation' | 'dataset' | 'datafile',
  filterKey: string,
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[],
  // NOTE: Support for nested values by providing a dataKey for API request
  //       which differs from filter key used in code.
  dataKey?: string
): Promise<string[]> => {
  const params = new URLSearchParams();
  // Allow for other additional filters to be applied.
  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      params.append(filter.filterType, filter.filterValue);
    });
  }

  // Add in the distinct if it as not already been added.
  const distinctFilterString = params.get('distinct');
  // Use the dataKey if provided, this allows for nested items
  // to be read as requesting them from the API maybe in a different format.
  // i.e. investigationInstruments[0].instrument maybe requested as investigationInstruments.instrument
  const filterValue = dataKey ? dataKey : filterKey;
  if (distinctFilterString) {
    const distinctFilter: string | string[] = JSON.parse(distinctFilterString);
    if (typeof distinctFilter === 'string') {
      params.set('distinct', JSON.stringify([distinctFilter, filterValue]));
    } else {
      params.set('distinct', JSON.stringify([...distinctFilter, filterValue]));
    }
  } else {
    params.set('distinct', JSON.stringify(filterValue));
  }

  return axios
    .get<Entity[]>(`${apiUrl}/${entityType}s`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data.map((x) => nestedValue(x, filterKey));
    });
};

// TODO: name this in a way to not get confused with filtering in general?
export const useFilter = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  filterKey: string,
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[]
): UseQueryResult<string[], Error> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<
    string[],
    AxiosError,
    string[],
    [
      'investigation' | 'dataset' | 'datafile',
      string,
      {
        filterType: 'where' | 'distinct' | 'include';
        filterValue: string;
      }[]?
    ]
  >(
    [entityType, filterKey, additionalFilters],
    ({ queryKey }) =>
      fetchFilter(apiUrl, queryKey[0], queryKey[1], queryKey[2]),
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};
