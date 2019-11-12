import {
  ActionType,
  StateType,
  ThunkResult,
  ApplicationStrings,
} from '../app.types';
import {
  SortTablePayload,
  SortTableType,
  FilterTablePayload,
  FilterTableType,
  ClearTableType,
  ConfigureStringsType,
  ConfigureStringsPayload,
  FeatureSwitches,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  URLs,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  SettingsLoadedType,
} from './actions.types';
import { Filter, Order } from 'datagateway-common';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';

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

export const clearTable = (): Action => ({
  type: ClearTableType,
});

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
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

export const loadUrls = (urls: URLs): ActionType<ConfigureUrlsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
  },
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get('/datagateway-table-settings.json')
      .then(res => {
        const settings = res.data;

        // invalid settings.json
        if (typeof settings !== 'object') {
          throw Error('Invalid format');
        }

        if (settings['features']) {
          dispatch(loadFeatureSwitches(settings['features']));
        }

        dispatch(
          loadUrls({
            idsUrl: settings['idsUrl'],
            apiUrl: settings['apiUrl'],
          })
        );

        /* istanbul ignore if */
        if (process.env.NODE_ENV === `development`) {
          // TODO: get info from correct places when authorisation is sorted out in parent app
          axios
            .post(`${settings['apiUrl']}/sessions`, {
              username: 'user',
              password: 'password',
            })
            .then(response => {
              window.localStorage.setItem(
                'daaas:token',
                response.data.sessionID
              );
            })
            .catch(error => {
              log.error(`Can't contact API: ${error.message}`);
            });
        }

        const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
          ? '/' + settings['ui-strings']
          : settings['ui-strings'];
        dispatch(loadStrings(uiStringResourcesPath));

        dispatch(settingsLoaded());
      })
      .catch(error => {
        log.error(
          `Error loading datagateway-table-settings.json: ${error.message}`
        );
      });
  };
};
