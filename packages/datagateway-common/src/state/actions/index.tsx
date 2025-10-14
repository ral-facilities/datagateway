import { DownloadSettingsAccessMethod } from '../../app.types';
import { ActionType } from '../app.types';
import {
  ConfigureAccessMethodsPayload,
  ConfigureAccessMethodsType,
  ConfigureAnonUserNamePayload,
  ConfigureAnonUserNameType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureFeatureSwitchesType,
  ConfigureQueryRetriesPayload,
  ConfigureQueryRetriesType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  FeatureSwitches,
  FeatureSwitchesPayload,
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

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const loadAnonUserName = (
  anonUserName?: string
): ActionType<ConfigureAnonUserNamePayload> => ({
  type: ConfigureAnonUserNameType,
  payload: {
    anonUserName,
  },
});
