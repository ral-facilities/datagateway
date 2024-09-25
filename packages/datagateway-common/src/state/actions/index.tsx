import { ActionType } from '../app.types';
import {
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
