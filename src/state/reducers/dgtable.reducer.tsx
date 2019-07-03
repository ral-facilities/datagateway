import { DGTableState, Investigation, Entity, Dataset } from '../app.types';
import createReducer from './createReducer';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessPayload,
  FetchInvestigationsFailurePayload,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FilterTablePayload,
  FilterTableType,
  FetchDatasetsSuccessPayload,
  FetchDatasetsFailurePayload,
  FetchDatafilesSuccessPayload,
  FetchDatafilesFailurePayload,
  FetchDatasetsRequestType,
  FetchDatasetsSuccessType,
  FetchDatasetsFailureType,
  FetchDatafilesRequestType,
  FetchDatafilesSuccessType,
  FetchDatafilesFailureType,
  FetchDatasetCountSuccessPayload,
  FetchDatasetCountRequestType,
  FetchDatasetCountSuccessType,
  FetchDatasetCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
  FetchDatafileCountSuccessPayload,
  FetchDatafileCountFailurePayload,
} from '../actions/actions.types';

export const initialState: DGTableState = {
  data: [],
  loading: false,
  error: null,
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
  } else if (state.sort) {
    // if order is null, user no longer wants to sort by column so remove column from sort state if it exists
    const { [column]: order, ...rest } = state.sort;
    return {
      ...state,
      sort: {
        ...rest,
      },
    };
  } else {
    return state;
  }
}

export function handleFilterTable(
  state: DGTableState,
  payload: FilterTablePayload
): DGTableState {
  return {
    ...state,
    filters: {
      ...state.filters,
      [payload.column]: payload.filter,
    },
  };
}

export function handleFetchInvestigationsRequest(
  state: DGTableState
): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchInvestigationsSuccess(
  state: DGTableState,
  payload: FetchInvestigationsSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: payload.investigations,
    error: null,
  };
}

export function handleFetchInvestigationsFailure(
  state: DGTableState,
  payload: FetchInvestigationsFailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: [],
    error: payload.error,
  };
}

export function handleFetchDatasetsRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchDatasetsSuccess(
  state: DGTableState,
  payload: FetchDatasetsSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: payload.datasets,
    error: null,
  };
}

export function handleFetchDatasetsFailure(
  state: DGTableState,
  payload: FetchDatasetsFailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: [],
    error: payload.error,
  };
}

export function handleFetchDatasetCountRequest(
  state: DGTableState
): DGTableState {
  return {
    ...state,
  };
}

export function handleFetchDatasetCountSuccess(
  state: DGTableState,
  payload: FetchDatasetCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const investigation = entity as Investigation;
      return investigation.ID === payload.investigationId
        ? { ...investigation, DATASET_COUNT: payload.count }
        : investigation;
    }),
    error: null,
  };
}

export function handleFetchDatasetCountFailure(
  state: DGTableState,
  payload: FetchDatasetsFailurePayload
): DGTableState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDatafilesRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchDatafilesSuccess(
  state: DGTableState,
  payload: FetchDatafilesSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: payload.datafiles,
    error: null,
  };
}

export function handleFetchDatafilesFailure(
  state: DGTableState,
  payload: FetchDatafilesFailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: [],
    error: payload.error,
  };
}

export function handleFetchDatafileCountRequest(
  state: DGTableState
): DGTableState {
  return {
    ...state,
  };
}

export function handleFetchDatafileCountSuccess(
  state: DGTableState,
  payload: FetchDatafileCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const dataset = entity as Dataset;
      return dataset.ID === payload.datasetId
        ? { ...dataset, DATAFILE_COUNT: payload.count }
        : dataset;
    }),
    error: null,
  };
}

export function handleFetchDatafileCountFailure(
  state: DGTableState,
  payload: FetchDatafileCountFailurePayload
): DGTableState {
  return {
    ...state,
    error: payload.error,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SortTableType]: handleSortTable,
  [FilterTableType]: handleFilterTable,
  [FetchInvestigationsRequestType]: handleFetchInvestigationsRequest,
  [FetchInvestigationsSuccessType]: handleFetchInvestigationsSuccess,
  [FetchInvestigationsFailureType]: handleFetchInvestigationsFailure,
  [FetchDatasetsRequestType]: handleFetchDatasetsRequest,
  [FetchDatasetsSuccessType]: handleFetchDatasetsSuccess,
  [FetchDatasetsFailureType]: handleFetchDatasetsFailure,
  [FetchDatasetCountRequestType]: handleFetchDatasetCountRequest,
  [FetchDatasetCountSuccessType]: handleFetchDatasetCountSuccess,
  [FetchDatasetCountFailureType]: handleFetchDatasetCountFailure,
  [FetchDatafilesRequestType]: handleFetchDatafilesRequest,
  [FetchDatafilesSuccessType]: handleFetchDatafilesSuccess,
  [FetchDatafilesFailureType]: handleFetchDatafilesFailure,
  [FetchDatafileCountRequestType]: handleFetchDatafileCountRequest,
  [FetchDatafileCountSuccessType]: handleFetchDatafileCountSuccess,
  [FetchDatafileCountFailureType]: handleFetchDatafileCountFailure,
});

export default DGTableReducer;
