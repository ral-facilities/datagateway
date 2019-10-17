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
  ConfigureStringsType,
  ConfigureStringsPayload,
  FeatureSwitches,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  URLs,
  ConfigureUrlsPayload,
  ConfigureURLsType,
} from './actions.types';
import { Filter, Order } from 'datagateway-common';
import axios from 'axios';
import * as log from 'loglevel';
import { fetchDownloadCart } from './cart';

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
export * from './cart';

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

export const loadUrls = (urls: URLs): ActionType<ConfigureUrlsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
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

        dispatch(
          loadUrls({
            idsUrl: settings['idsUrl'],
            apiUrl: settings['apiUrl'],
            downloadApiUrl: settings['downloadApiUrl'],
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

          // TODO: replace with getting from daaas:token when supported
          const splitUrl = settings.downloadApiUrl.split('/');
          const icatUrl = `${splitUrl
            .slice(0, splitUrl.length - 1)
            .join('/')}/icat`;
          axios
            .post(
              `${icatUrl}/session`,
              {
                json: {
                  plugin: 'simple',
                  credentials: [{ username: 'root' }, { password: 'pw' }],
                },
              },
              {
                headers: {
                  contentType: 'application/x-www-form-urlencoded',
                },
              }
            )
            .then(response => {
              console.log(response.data.sessionId);
              window.localStorage.setItem(
                'icat:token',
                response.data.sessionId
              );
            });
        }

        const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
          ? '/' + settings['ui-strings']
          : settings['ui-strings'];
        dispatch(loadStrings(uiStringResourcesPath));

        // fetch initial download cart
        dispatch(fetchDownloadCart());
      })
      .catch(error => {
        log.error(`Error loading settings.json: ${error.message}`);
      });
  };
};
