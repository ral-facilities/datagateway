import { DGTableState } from '../app.types';
import createReducer from './createReducer';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FilterTablePayload,
  FilterTableType,
  FetchDatasetsRequestType,
  FetchDatasetsSuccessType,
  FetchDatasetsFailureType,
  FetchDatafilesRequestType,
  FetchDatafilesSuccessType,
  FetchDatafilesFailureType,
  FetchInvestigationDatasetsCountRequestType,
  FetchInvestigationDatasetsCountSuccessType,
  FetchInvestigationDatasetsCountFailureType,
  FetchDatasetDatafilesCountRequestType,
  FetchDatasetDatafilesCountSuccessType,
  FetchDatasetDatafilesCountFailureType,
  FetchInstrumentsFailureType,
  FetchInstrumentsSuccessType,
  FetchInstrumentsRequestType,
  FetchFacilityCyclesRequestType,
  FetchFacilityCyclesSuccessType,
  FetchFacilityCyclesFailureType,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
  DownloadDatafileSuccessType,
  DownloadDatasetRequestType,
  DownloadDatasetSuccessType,
  DownloadDatasetFailureType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchCountSuccessPayload,
  FetchInvestigationCountRequestType,
  FetchInvestigationCountSuccessType,
  FetchInvestigationCountFailureType,
  FetchDatasetCountRequestType,
  FetchDatasetCountSuccessType,
  FetchDatasetCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
  FetchInstrumentCountSuccessType,
  FetchInstrumentCountRequestType,
  FetchInstrumentCountFailureType,
  FetchFacilityCycleCountRequestType,
  FetchFacilityCycleCountSuccessType,
  FetchFacilityCycleCountFailureType,
  ClearTableType,
  RequestPayload,
  FeatureSwitchesPayload,
  ConfigureStringsPayload,
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
  FetchInvestigationDetailsRequestType,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchDatasetDetailsRequestType,
  FetchDatasetDetailsSuccessType,
  FetchDatasetDetailsFailureType,
} from '../actions/actions.types';
import { Entity, Investigation, Dataset } from 'datagateway-common';

export const initialState: DGTableState = {
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
  urls: {
    idsUrl: '',
    apiUrl: '',
  },
  breadcrumbSettings: {},
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

export function handleFilterTable(
  state: DGTableState,
  payload: FilterTablePayload
): DGTableState {
  const { column, filter } = payload;
  if (filter !== null) {
    // if given an defined filter, update the relevant column in the sort state
    return {
      ...state,
      filters: {
        ...state.filters,
        [column]: filter,
      },
      data: [],
      totalDataCount: 0,
    };
  } else {
    // if filter is null, user no longer wants to filter by that column so remove column from filter state
    const { [column]: filter, ...rest } = state.filters;
    return {
      ...state,
      filters: {
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

export function handleClearTable(state: DGTableState): DGTableState {
  return {
    ...state,
    data: [],
    totalDataCount: 0,
    loading: false,
    downloading: false,
    error: null,
    sort: {},
    filters: {},
  };
}

export function handleFetchDataRequest(
  state: DGTableState,
  payload: RequestPayload
): DGTableState {
  if (payload.timestamp >= state.dataTimestamp) {
    return {
      ...state,
      dataTimestamp: payload.timestamp,
      loading: true,
    };
  } else {
    return state;
  }
}

export function handleFetchDataSuccess(
  state: DGTableState,
  payload: FetchDataSuccessPayload
): DGTableState {
  if (payload.timestamp >= state.dataTimestamp) {
    return {
      ...state,
      loading: false,
      data: state.data.concat(payload.data),
      dataTimestamp: payload.timestamp,
      error: null,
    };
  } else {
    return state;
  }
}

export function handleFetchDataFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchCountRequest(
  state: DGTableState,
  payload: RequestPayload
): DGTableState {
  if (payload.timestamp >= state.countTimestamp) {
    return {
      ...state,
      countTimestamp: payload.timestamp,
      loading: true,
    };
  } else {
    return state;
  }
}

export function handleFetchCountSuccess(
  state: DGTableState,
  payload: FetchCountSuccessPayload
): DGTableState {
  if (payload.timestamp >= state.countTimestamp) {
    return {
      ...state,
      loading: false,
      totalDataCount: payload.count,
      countTimestamp: payload.timestamp,
      error: null,
    };
  } else {
    return state;
  }
}

export function handleFetchCountFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchDataDetailsRequest(
  state: DGTableState
): DGTableState {
  return {
    ...state,
  };
}

export function handleFetchDataDetailsFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDataDetailsSuccess(
  state: DGTableState,
  payload: FetchDataSuccessPayload
): DGTableState {
  return {
    ...state,
    data: state.data.map((entity: Entity) => {
      return entity.ID === payload.data[0].ID
        ? { ...payload.data[0], ...entity }
        : entity;
    }),
    error: null,
  };
}

export function handleFetchDataCountRequest(state: DGTableState): DGTableState {
  return {
    ...state,
  };
}

export function handleFetchDataCountFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDatasetCountSuccess(
  state: DGTableState,
  payload: FetchDataCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const investigation = entity as Investigation;

      return investigation.ID === payload.id
        ? { ...investigation, DATASET_COUNT: payload.count }
        : investigation;
    }),
    investigationCache: {
      ...state.investigationCache,
      [payload.id]: {
        ...state.investigationCache[payload.id],
        childEntityCount: payload.count,
      },
    },
    error: null,
  };
}

export function handleDownloadDataRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    downloading: true,
  };
}

export function handleDownloadDataSuccess(state: DGTableState): DGTableState {
  return {
    ...state,
    downloading: false,
  };
}

export function handleDownloadDataFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    downloading: false,
    error: payload.error,
  };
}

export function handleFetchDatasetDatafilesCountSuccess(
  state: DGTableState,
  payload: FetchDataCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const dataset = entity as Dataset;

      return dataset.ID === payload.id
        ? { ...dataset, DATAFILE_COUNT: payload.count }
        : dataset;
    }),
    datasetCache: {
      ...state.datasetCache,
      [payload.id]: {
        ...state.datasetCache[payload.id],
        childEntityCount: payload.count,
      },
    },
    error: null,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [SortTableType]: handleSortTable,
  [FilterTableType]: handleFilterTable,
  [ClearTableType]: handleClearTable,
  [ConfigureStringsType]: handleConfigureStrings,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureURLsType]: handleConfigureUrls,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
  [FetchInvestigationsRequestType]: handleFetchDataRequest,
  [FetchInvestigationsSuccessType]: handleFetchDataSuccess,
  [FetchInvestigationsFailureType]: handleFetchDataFailure,
  [FetchInvestigationDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchInvestigationDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchInvestigationDetailsFailureType]: handleFetchDataDetailsFailure,
  [FetchDatasetsRequestType]: handleFetchDataRequest,
  [FetchDatasetsSuccessType]: handleFetchDataSuccess,
  [FetchDatasetsFailureType]: handleFetchDataFailure,
  [FetchDatasetDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchDatasetDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchDatasetDetailsFailureType]: handleFetchDataDetailsFailure,
  [FetchInvestigationCountRequestType]: handleFetchCountRequest,
  [FetchInvestigationCountSuccessType]: handleFetchCountSuccess,
  [FetchInvestigationCountFailureType]: handleFetchCountFailure,
  [FetchDatasetCountRequestType]: handleFetchCountRequest,
  [FetchDatasetCountSuccessType]: handleFetchCountSuccess,
  [FetchDatasetCountFailureType]: handleFetchCountFailure,
  [FetchInvestigationDatasetsCountRequestType]: handleFetchDataCountRequest,
  [FetchInvestigationDatasetsCountSuccessType]: handleFetchDatasetCountSuccess,
  [FetchInvestigationDatasetsCountFailureType]: handleFetchDataCountFailure,
  [DownloadDatasetRequestType]: handleDownloadDataRequest,
  [DownloadDatasetSuccessType]: handleDownloadDataSuccess,
  [DownloadDatasetFailureType]: handleDownloadDataFailure,
  [FetchDatafilesRequestType]: handleFetchDataRequest,
  [FetchDatafilesSuccessType]: handleFetchDataSuccess,
  [FetchDatafilesFailureType]: handleFetchDataFailure,
  [FetchDatafileCountRequestType]: handleFetchCountRequest,
  [FetchDatafileCountSuccessType]: handleFetchCountSuccess,
  [FetchDatafileCountFailureType]: handleFetchCountFailure,
  [FetchDatasetDatafilesCountRequestType]: handleFetchDataCountRequest,
  [FetchDatasetDatafilesCountSuccessType]: handleFetchDatasetDatafilesCountSuccess,
  [FetchDatasetDatafilesCountFailureType]: handleFetchDataCountFailure,
  [DownloadDatafileRequestType]: handleDownloadDataRequest,
  [DownloadDatafileSuccessType]: handleDownloadDataSuccess,
  [DownloadDatafileFailureType]: handleDownloadDataFailure,
  [FetchInstrumentsRequestType]: handleFetchDataRequest,
  [FetchInstrumentsSuccessType]: handleFetchDataSuccess,
  [FetchInstrumentsFailureType]: handleFetchDataFailure,
  [FetchInstrumentCountRequestType]: handleFetchCountRequest,
  [FetchInstrumentCountSuccessType]: handleFetchCountSuccess,
  [FetchInstrumentCountFailureType]: handleFetchCountFailure,
  [FetchFacilityCyclesRequestType]: handleFetchDataRequest,
  [FetchFacilityCyclesSuccessType]: handleFetchDataSuccess,
  [FetchFacilityCyclesFailureType]: handleFetchDataFailure,
  [FetchFacilityCycleCountRequestType]: handleFetchCountRequest,
  [FetchFacilityCycleCountSuccessType]: handleFetchCountSuccess,
  [FetchFacilityCycleCountFailureType]: handleFetchCountFailure,
});

export default DGTableReducer;
