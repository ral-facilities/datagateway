import {
  loadAccessMethods,
  loadAnonUserName,
  loadFacilityName,
  loadFeatureSwitches,
  loadQueryRetries,
  loadUrls,
} from 'datagateway-common';
import { Action } from 'redux';
import { settings } from '../../settings';
import { ActionType, ThunkResult } from '../app.types';
import {
  ConfigureMaxNumResultsPayload,
  ConfigureMaxNumResultsType,
  ConfigureMinNumResultsPayload,
  ConfigureMinNumResultsType,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
  SettingsLoadedType,
} from './actions.types';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadSearchableEntitites = (
  entities: string[]
): ActionType<ConfigureSearchableEntitiesPayload> => ({
  type: ConfigureSearchableEntitiesType,
  payload: {
    entities: entities,
  },
});

export const loadMaxNumResults = (
  maxNumResults: number
): ActionType<ConfigureMaxNumResultsPayload> => ({
  type: ConfigureMaxNumResultsType,
  payload: {
    maxNumResults: maxNumResults,
  },
});

export const loadMinNumResults = (
  minNumResults: number
): ActionType<ConfigureMinNumResultsPayload> => ({
  type: ConfigureMinNumResultsType,
  payload: {
    minNumResults: minNumResults,
  },
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    const settingsResult = await settings;
    if (settingsResult) {
      dispatch(loadFacilityName(settingsResult['facilityName']));

      dispatch(
        loadUrls({
          idsUrl: settingsResult['idsUrl'],
          apiUrl: settingsResult['apiUrl'],
          downloadApiUrl: settingsResult['downloadApiUrl'],
          icatUrl: settingsResult['icatUrl'],
        })
      );

      // features is an optional setting
      if (settingsResult?.['features'] !== undefined) {
        dispatch(loadFeatureSwitches(settingsResult['features']));
      }

      if (settingsResult?.['anonUserName'] !== undefined) {
        dispatch(loadAnonUserName(settingsResult['anonUserName']));
      }

      if (settingsResult?.['queryRetries'] !== undefined) {
        dispatch(loadQueryRetries(settingsResult['queryRetries']));
      }

      if (settingsResult?.['accessMethods'] !== undefined) {
        dispatch(loadAccessMethods(settingsResult['accessMethods']));
      }

      if (settingsResult?.['searchableEntities'] !== undefined) {
        dispatch(loadSearchableEntitites(settingsResult['searchableEntities']));
      }

      if (settingsResult?.['minNumResults'] !== undefined) {
        dispatch(loadMinNumResults(settingsResult['minNumResults']));
      }

      if (settingsResult?.['maxNumResults'] !== undefined) {
        dispatch(loadMaxNumResults(settingsResult['maxNumResults']));
      }

      dispatch(settingsLoaded());
    }
  };
};
