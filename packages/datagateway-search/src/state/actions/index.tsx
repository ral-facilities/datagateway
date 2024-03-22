import { ActionType, ThunkResult } from '../app.types';
import {
  ConfigureSelectAllSettingPayload,
  ConfigureSelectAllSettingType,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
  SettingsLoadedType,
  ConfigureMaxNumResultsPayload,
  ConfigureMaxNumResultsType,
  ConfigureMinNumResultsPayload,
  ConfigureMinNumResultsType,
} from './actions.types';
import { loadUrls, loadFacilityName } from 'datagateway-common';
import { Action } from 'redux';
import { settings } from '../../settings';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadSelectAllSetting = (
  selectAllSetting: boolean
): ActionType<ConfigureSelectAllSettingPayload> => ({
  type: ConfigureSelectAllSettingType,
  payload: {
    settings: selectAllSetting,
  },
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

      if (settingsResult?.['selectAllSetting'] !== undefined) {
        dispatch(loadSelectAllSetting(settingsResult['selectAllSetting']));
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
