import { DownloadSettingsAccessMethod } from '../../app.types';
import { ActionType } from '../app.types';
import {
  ConfigureAccessMethodsPayload,
  ConfigureAccessMethodsType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureQueryRetriesPayload,
  ConfigureQueryRetriesType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  URLs,
} from './actions.types';

export const loadFacilityName = (
  name: string
): ActionType<ConfigureFacilityNamePayload> => ({
  type: ConfigureFacilityNameType,
  payload: {
    facilityName: name,
  },
});

export const loadUrls = (urls: URLs): ActionType<ConfigureUrlsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
  },
});

export const loadQueryRetries = (
  queryRetries?: number
): ActionType<ConfigureQueryRetriesPayload> => ({
  type: ConfigureQueryRetriesType,
  payload: {
    queryRetries,
  },
});

export const loadAccessMethods = (
  accessMethods?: DownloadSettingsAccessMethod
): ActionType<ConfigureAccessMethodsPayload> => ({
  type: ConfigureAccessMethodsType,
  payload: {
    accessMethods,
  },
});
