import { DGTableState } from '../app.types';
import createReducer from './createReducer';
import {
  SortTablePayload,
  FeatureSwitchesPayload,
  ConfigureStringsPayload,
  ConfigureStringsType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureFeatureSwitchesType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
} from '../actions/actions.types';

export const initialState: DGTableState = {
  facilityName: '',
  data: [],
  totalDataCount: 0,
  investigationCache: {},
  datasetCache: {},
  loading: false,
  downloading: false,
  error: null,
  sort: {},
  filters: {},
  features: {},
  dataTimestamp: Date.now(),
  countTimestamp: Date.now(),
  allIdsTimestamp: Date.now(),
  urls: {
    idsUrl: '',
    apiUrl: '',
    downloadApiUrl: '',
  },
  breadcrumbSettings: {},
  cartItems: [],
  allIds: [],
  settingsLoaded: false,
};

export function handleSettingsLoaded(state: DGTableState): DGTableState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleSortTable(
  state: DGTableState,
  payload: SortTablePayload
): DGTableState {
  const { column, order } = payload;
  if (order !== null) {
    // if given an defined order (asc or desc), update the relevant column in the sort state
    return {
      ...state,
      sort: {
        ...state.sort,
        [column]: order,
      },
      data: [],
      totalDataCount: 0,
    };
  } else {
    // if order is null, user no longer wants to sort by that column so remove column from sort state
    const { [column]: order, ...rest } = state.sort;
    return {
      ...state,
      sort: {
        ...rest,
      },
      data: [],
      totalDataCount: 0,
    };
  }
}

export function handleConfigureStrings(
  state: DGTableState,
  payload: ConfigureStringsPayload
): DGTableState {
  return {
    ...state,
    res: payload.res,
  };
}

export function handleConfigureFacilityName(
  state: DGTableState,
  payload: ConfigureFacilityNamePayload
): DGTableState {
  return {
    ...state,
    facilityName: payload.facilityName,
  };
}

export function handleConfigureFeatureSwitches(
  state: DGTableState,
  payload: FeatureSwitchesPayload
): DGTableState {
  return {
    ...state,
    features: payload.switches,
  };
}

export function handleConfigureUrls(
  state: DGTableState,
  payload: ConfigureUrlsPayload
): DGTableState {
  return {
    ...state,
    urls: payload.urls,
  };
}

// Reducer for the breadcrumb settings action,
// in order to add settings to the Redux state.
export function handleConfigureBreadcrumbSettings(
  state: DGTableState,
  payload: ConfigureBreadcrumbSettingsPayload
): DGTableState {
  return {
    ...state,
    breadcrumbSettings: payload.settings,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureStringsType]: handleConfigureStrings,
  [ConfigureFacilityNameType]: handleConfigureFacilityName,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureURLsType]: handleConfigureUrls,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
});

export default DGTableReducer;
