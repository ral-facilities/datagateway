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
  FetchDatasetCountRequestType,
  FetchDatasetCountSuccessType,
  FetchDatasetCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
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
  FeatureSwitchesPayload,
  ConfigureStringsPayload,
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  FetchInvestigationDetailsRequestType,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchDatasetDetailsRequestType,
  FetchDatasetDetailsSuccessType,
  FetchDatasetDetailsFailureType,
  FetchInstrumentDetailsRequestType,
  FetchInstrumentDetailsSuccessType,
  FetchInstrumentDetailsFailureType,
} from '../actions/actions.types';
import { Entity, Investigation, Dataset } from 'datagateway-common';

export const initialState: DGTableState = {
  data: [],
  loading: false,
  downloading: false,
  error: null,
  sort: {},
  filters: {},
  features: {},
  urls: {
    idsUrl: '',
    apiUrl: '',
  },
};

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
    };
  } else {
    // if order is null, user no longer wants to sort by that column so remove column from sort state
    const { [column]: order, ...rest } = state.sort;
    return {
      ...state,
      sort: {
        ...rest,
      },
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
    };
  } else {
    // if filter is null, user no longer wants to filter by that column so remove column from filter state
    const { [column]: filter, ...rest } = state.filters;
    return {
      ...state,
      filters: {
        ...rest,
      },
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

export function handleFetchDataRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchDataSuccess(
  state: DGTableState,
  payload: FetchDataSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: payload.data,
    error: null,
  };
}

export function handleFetchDataFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: [],
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

export function handleFetchDatafileCountSuccess(
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
    error: null,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SortTableType]: handleSortTable,
  [FilterTableType]: handleFilterTable,
  [ConfigureStringsType]: handleConfigureStrings,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureURLsType]: handleConfigureUrls,
  [FetchInvestigationsRequestType]: handleFetchDataRequest,
  [FetchInvestigationsSuccessType]: handleFetchDataSuccess,
  [FetchInvestigationsFailureType]: handleFetchDataFailure,
  [FetchInvestigationDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchInvestigationDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchInvestigationDetailsFailureType]: handleFetchDataDetailsFailure,
  [FetchDatasetsRequestType]: handleFetchDataRequest,
  [FetchDatasetsSuccessType]: handleFetchDataSuccess,
  [FetchDatasetsFailureType]: handleFetchDataFailure,
  [FetchDatasetCountRequestType]: handleFetchDataCountRequest,
  [FetchDatasetCountSuccessType]: handleFetchDatasetCountSuccess,
  [FetchDatasetCountFailureType]: handleFetchDataCountFailure,
  [FetchDatasetDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchDatasetDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchDatasetDetailsFailureType]: handleFetchDataDetailsFailure,
  [DownloadDatasetRequestType]: handleDownloadDataRequest,
  [DownloadDatasetSuccessType]: handleDownloadDataSuccess,
  [DownloadDatasetFailureType]: handleDownloadDataFailure,
  [FetchDatafilesRequestType]: handleFetchDataRequest,
  [FetchDatafilesSuccessType]: handleFetchDataSuccess,
  [FetchDatafilesFailureType]: handleFetchDataFailure,
  [FetchDatafileCountRequestType]: handleFetchDataCountRequest,
  [FetchDatafileCountSuccessType]: handleFetchDatafileCountSuccess,
  [FetchDatafileCountFailureType]: handleFetchDataCountFailure,
  [DownloadDatafileRequestType]: handleDownloadDataRequest,
  [DownloadDatafileSuccessType]: handleDownloadDataSuccess,
  [DownloadDatafileFailureType]: handleDownloadDataFailure,
  [FetchInstrumentsRequestType]: handleFetchDataRequest,
  [FetchInstrumentsSuccessType]: handleFetchDataSuccess,
  [FetchInstrumentsFailureType]: handleFetchDataFailure,
  [FetchInstrumentDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchInstrumentDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchInstrumentDetailsFailureType]: handleFetchDataDetailsFailure,
  [FetchFacilityCyclesRequestType]: handleFetchDataRequest,
  [FetchFacilityCyclesSuccessType]: handleFetchDataSuccess,
  [FetchFacilityCyclesFailureType]: handleFetchDataFailure,
});

export default DGTableReducer;
