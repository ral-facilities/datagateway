import {
  ActionType,
  Order,
  Filter,
  StateType,
  ThunkResult,
  ApplicationStrings,
} from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
  ConfigureStringsType,
  ConfigureStringsPayload,
  FeatureSwitches,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
} from './actions.types';
import axios from 'axios';
import * as log from 'loglevel';

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

export const configureStrings = (
  appStrings: ApplicationStrings
): ActionType<ConfigureStringsPayload> => ({
  type: ConfigureStringsType,
  payload: {
    res: appStrings,
  },
});

export const loadStrings = (path: string): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get(path)
      .then(res => {
        dispatch(configureStrings(res.data));
      })
      .catch(error =>
        log.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get('/settings.json')
      .then(res => {
        const settings = res.data;

        // invalid settings.json
        if (typeof settings !== 'object') {
          throw Error('Invalid format');
        }

        if (settings['features']) {
          dispatch(loadFeatureSwitches(settings['features']));
        }

        const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
          ? '/' + settings['ui-strings']
          : settings['ui-strings'];
        dispatch(loadStrings(uiStringResourcesPath));
      })
      .catch(error => {
        log.error(`Error loading settings.json: ${error.message}`);
      });
  };
};
