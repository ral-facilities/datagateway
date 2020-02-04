import { ActionType } from '../app.types';
import {
  URLs,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
} from './actions.types';

export * from './investigations';
export * from './datasets';
export * from './datafiles';
export * from './cart';
export * from './instruments';
export * from './facilityCycles';

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
