import {
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
} from '../actions/actions.types';
import { DGCommonState } from '../app.types';
import createReducer from './createReducer';

export const initialState: DGCommonState = {
  facilityName: '',
  urls: {
    idsUrl: '',
    apiUrl: '',
    downloadApiUrl: '',
    icatUrl: '',
  },
};

export function handleConfigureFacilityName(
  state: DGCommonState,
  payload: ConfigureFacilityNamePayload
): DGCommonState {
  return {
    ...state,
    facilityName: payload.facilityName,
  };
}

export function handleConfigureUrls(
  state: DGCommonState,
  payload: ConfigureUrlsPayload
): DGCommonState {
  return {
    ...state,
    urls: payload.urls,
  };
}

const dGCommonReducer = createReducer(initialState, {
  [ConfigureFacilityNameType]: handleConfigureFacilityName,
  [ConfigureURLsType]: handleConfigureUrls,
});

export default dGCommonReducer;
