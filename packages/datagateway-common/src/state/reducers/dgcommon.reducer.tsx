import { Dataset, Entity, Investigation } from '../../app.types';
import {
  AddToCartFailureType,
  AddToCartRequestType,
  AddToCartSuccessType,
  ClearDataType,
  // ClearFiltersType,
  // ClearSortType,
  ClearTableType,
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  DownloadCartPayload,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
  DownloadDatafileSuccessType,
  DownloadDatasetFailureType,
  DownloadDatasetRequestType,
  DownloadDatasetSuccessType,
  FailurePayload,
  FetchAllIdsFailureType,
  FetchAllIdsRequestType,
  FetchAllIdsSuccessPayload,
  FetchAllIdsSuccessType,
  FetchCountSuccessPayload,
  FetchDataCountSuccessPayload,
  FetchDatafileCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileDetailsFailureType,
  FetchDatafileDetailsRequestType,
  FetchDatafileDetailsSuccessType,
  FetchDatafilesFailureType,
  FetchDatafilesRequestType,
  FetchDatafilesSuccessType,
  FetchDatasetCountFailureType,
  FetchDatasetCountRequestType,
  FetchDatasetCountSuccessType,
  FetchDatasetDatafilesCountFailureType,
  FetchDatasetDatafilesCountRequestType,
  FetchDatasetDatafilesCountSuccessType,
  FetchDatasetDetailsFailureType,
  FetchDatasetDetailsRequestType,
  FetchDatasetDetailsSuccessType,
  FetchDatasetsFailureType,
  FetchDatasetSizeFailureType,
  FetchDatasetSizeRequestType,
  FetchDatasetSizeSuccessType,
  FetchDatasetsRequestType,
  FetchDatasetsSuccessType,
  FetchDataSuccessPayload,
  FetchDownloadCartFailureType,
  FetchDownloadCartRequestType,
  FetchDownloadCartSuccessType,
  FetchFacilityCycleCountFailureType,
  FetchFacilityCycleCountRequestType,
  FetchFacilityCycleCountSuccessType,
  FetchFacilityCyclesFailureType,
  FetchFacilityCyclesRequestType,
  FetchFacilityCyclesSuccessType,
  FetchFilterFailureType,
  FetchFilterRequestType,
  FetchFilterSuccessPayload,
  FetchFilterSuccessType,
  FetchInstrumentCountFailureType,
  FetchInstrumentCountRequestType,
  FetchInstrumentCountSuccessType,
  FetchInstrumentDetailsFailureType,
  FetchInstrumentDetailsRequestType,
  FetchInstrumentDetailsSuccessType,
  FetchInstrumentsFailureType,
  FetchInstrumentsRequestType,
  FetchInstrumentsSuccessType,
  FetchInvestigationCountFailureType,
  FetchInvestigationCountRequestType,
  FetchInvestigationCountSuccessType,
  FetchInvestigationDatasetsCountFailureType,
  FetchInvestigationDatasetsCountRequestType,
  FetchInvestigationDatasetsCountSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchInvestigationDetailsRequestType,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationSizeFailureType,
  FetchInvestigationSizeRequestType,
  FetchInvestigationSizeSuccessType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessType,
  FetchSizeSuccessPayload,
  FilterTablePayload,
  FilterTableType,
  RemoveFromCartFailureType,
  RemoveFromCartRequestType,
  RemoveFromCartSuccessType,
  RequestPayload,
  SaveViewPayload,
  SortTablePayload,
  SortTableType,
  UpdateFiltersPayload,
  UpdateFiltersType,
  UpdatePagePayload,
  UpdatePageType,
  UpdateQueriesPayload,
  UpdateQueriesType,
  UpdateResultsPayload,
  UpdateResultsType,
  UpdateSaveViewType,
  UpdateSortPayload,
  UpdateSortType,
  UpdateViewPayload,
  UpdateViewType,
} from '../actions/actions.types';
import { DGCommonState, QueryParams } from '../app.types';
import createReducer from './createReducer';

const initialQuery: QueryParams = {
  view: null,
  page: null,
  results: null,
};

export const initialState: DGCommonState = {
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
  filterData: {},
  dataTimestamp: Date.now(),
  countTimestamp: Date.now(),
  allIdsTimestamp: Date.now(),
  urls: {
    idsUrl: '',
    apiUrl: '',
    downloadApiUrl: '',
  },
  cartItems: [],
  allIds: [],
  query: initialQuery,
  savedView: {
    view: null,
    queries: null,
    filters: {},
    sort: {},
  },
};

export function handleSortTable(
  state: DGCommonState,
  payload: SortTablePayload
): DGCommonState {
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
  state: DGCommonState,
  payload: FilterTablePayload
): DGCommonState {
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

export function handleConfigureFacilityName(
  state: DGCommonState,
  payload: ConfigureFacilityNamePayload
): DGCommonState {
  return {
    ...state,
    facilityName: payload.facilityName,
  };
}

export function handleClearTable(state: DGCommonState): DGCommonState {
  return {
    ...state,
    data: [],
    totalDataCount: 0,
    loading: false,
    downloading: false,
    error: null,
    // TODO: We clear filters, sort on load URL query.
    sort: {},
    filters: {},
  };
}

export function handleClearData(state: DGCommonState): DGCommonState {
  return {
    ...state,
    data: [],
  };
}

// export function handleClearFilters(state: DGCommonState): DGCommonState {
//   return {
//     ...state,
//     filters: {},
//   };
// }

// export function handleClearSort(state: DGCommonState): DGCommonState {
//   return {
//     ...state,
//     sort: {},
//   };
// }

export function handleUpdateView(
  state: DGCommonState,
  payload: UpdateViewPayload
): DGCommonState {
  return {
    ...state,
    query: {
      ...state.query,
      view: payload.view,
    },
  };
}

export function handleUpdatePage(
  state: DGCommonState,
  payload: UpdatePagePayload
): DGCommonState {
  return {
    ...state,
    query: {
      ...state.query,
      page: payload.page,
    },
  };
}

export function handleUpdateResults(
  state: DGCommonState,
  payload: UpdateResultsPayload
): DGCommonState {
  return {
    ...state,
    query: {
      ...state.query,
      results: payload.results,
    },
  };
}

export function handleUpdateFilters(
  state: DGCommonState,
  payload: UpdateFiltersPayload
): DGCommonState {
  return {
    ...state,
    filters: payload.filters,
    data: [],
    totalDataCount: 0,
  };
}

export function handleUpdateSort(
  state: DGCommonState,
  payload: UpdateSortPayload
): DGCommonState {
  return {
    ...state,
    sort: payload.sort,
    data: [],
    totalDataCount: 0,
  };
}

export function handleUpdateQueries(
  state: DGCommonState,
  payload: UpdateQueriesPayload
): DGCommonState {
  return {
    ...state,
    query: payload.queries,
  };
}

export function handleSaveView(
  state: DGCommonState,
  payload: SaveViewPayload
): DGCommonState {
  return {
    ...state,
    // Clear current information to reload on new view.
    data: [],
    totalDataCount: 0,

    // Switch view and save view information.
    sort: state.savedView.sort,
    filters: state.savedView.filters,
    query: state.savedView.queries ? state.savedView.queries : initialQuery,
    savedView: {
      view: payload.view,
      queries: state.query,
      filters: state.filters,
      sort: state.sort,
    },
  };
}

export function handleFetchDataRequest(
  state: DGCommonState,
  payload: RequestPayload
): DGCommonState {
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
  state: DGCommonState,
  payload: FetchDataSuccessPayload
): DGCommonState {
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
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchCountRequest(
  state: DGCommonState,
  payload: RequestPayload
): DGCommonState {
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
  state: DGCommonState,
  payload: FetchCountSuccessPayload
): DGCommonState {
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
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchSizeRequest(state: DGCommonState): DGCommonState {
  return {
    ...state,
  };
}

export function handleFetchInvestigationSizeSuccess(
  state: DGCommonState,
  payload: FetchSizeSuccessPayload
): DGCommonState {
  return {
    ...state,
    data: state.data.map((entity: Entity) => {
      const investigation = entity as Investigation;

      return investigation.ID === payload.id
        ? { ...investigation, SIZE: payload.size }
        : investigation;
    }),
    investigationCache: {
      ...state.investigationCache,
      [payload.id]: {
        ...state.investigationCache[payload.id],
        childEntitySize: payload.size,
      },
    },
    error: null,
  };
}

export function handleFetchDatasetSizeSuccess(
  state: DGCommonState,
  payload: FetchSizeSuccessPayload
): DGCommonState {
  return {
    ...state,
    data: state.data.map((entity: Entity) => {
      const dataset = entity as Dataset;

      return dataset.ID === payload.id
        ? { ...dataset, SIZE: payload.size }
        : dataset;
    }),
    datasetCache: {
      ...state.datasetCache,
      [payload.id]: {
        ...state.datasetCache[payload.id],
        childEntitySize: payload.size,
      },
    },
    error: null,
  };
}

export function handleFetchSizeFailure(
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDataDetailsRequest(
  state: DGCommonState
): DGCommonState {
  return {
    ...state,
  };
}

export function handleFetchDataDetailsFailure(
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDataDetailsSuccess(
  state: DGCommonState,
  payload: FetchDataSuccessPayload
): DGCommonState {
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

export function handleFetchDataCountRequest(
  state: DGCommonState
): DGCommonState {
  return {
    ...state,
  };
}

export function handleFetchDataCountFailure(
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDatasetCountSuccess(
  state: DGCommonState,
  payload: FetchDataCountSuccessPayload
): DGCommonState {
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

export function handleDownloadDataRequest(state: DGCommonState): DGCommonState {
  return {
    ...state,
    downloading: true,
  };
}

export function handleDownloadDataSuccess(state: DGCommonState): DGCommonState {
  return {
    ...state,
    downloading: false,
  };
}

export function handleDownloadDataFailure(
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    downloading: false,
    error: payload.error,
  };
}

export function handleFetchDatasetDatafilesCountSuccess(
  state: DGCommonState,
  payload: FetchDataCountSuccessPayload
): DGCommonState {
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

export function handleDownloadCartRequest(state: DGCommonState): DGCommonState {
  return {
    ...state,
    loading: true,
  };
}

export function handleDownloadCartSuccess(
  state: DGCommonState,
  payload: DownloadCartPayload
): DGCommonState {
  return {
    ...state,
    loading: false,
    cartItems: payload.downloadCart.cartItems,
    // cartItems: payload.downloadCart.cartItems.map(cartItem => ({
    //   entityId: cartItem.entityId,
    //   entityType: cartItem.entityType,
    // })),
  };
}
// grab to common
export function handleDownloadCartFailure(
  state: DGCommonState,
  payload: FailurePayload
): DGCommonState {
  return {
    ...state,
    loading: false,
    error: payload.error,
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

export function handleFetchAllIdsRequest(
  state: DGCommonState,
  payload: RequestPayload
): DGCommonState {
  if (payload.timestamp >= state.allIdsTimestamp) {
    return {
      ...state,
      allIdsTimestamp: payload.timestamp,
      loading: true,
    };
  } else {
    return state;
  }
}

export function handleFetchAllIdsSuccess(
  state: DGCommonState,
  payload: FetchAllIdsSuccessPayload
): DGCommonState {
  if (payload.timestamp >= state.allIdsTimestamp) {
    return {
      ...state,
      loading: false,
      allIds: payload.data,
      allIdsTimestamp: payload.timestamp,
    };
  } else {
    return state;
  }
}

export function handleFetchFilterRequest(
  state: DGCommonState,
  payload: RequestPayload
): DGCommonState {
  return {
    ...state,
    loading: false,
  };
}

export function handleFetchFilterSuccess(
  state: DGCommonState,
  payload: FetchFilterSuccessPayload
): DGCommonState {
  return {
    ...state,
    loading: false,
    filterData: {
      ...state.filterData,
      [payload.filterKey]: payload.data,
    },
  };
}

// remove things I want
const dGCommonReducer = createReducer(initialState, {
  [ConfigureFacilityNameType]: handleConfigureFacilityName,
  [ConfigureURLsType]: handleConfigureUrls,
  [SortTableType]: handleSortTable,
  [FilterTableType]: handleFilterTable,
  [ClearTableType]: handleClearTable,
  [ClearDataType]: handleClearData,
  // [ClearFiltersType]: handleClearFilters,
  // [ClearSortType]: handleClearSort,
  [UpdateViewType]: handleUpdateView,
  [UpdatePageType]: handleUpdatePage,
  [UpdateResultsType]: handleUpdateResults,
  [UpdateFiltersType]: handleUpdateFilters,
  [UpdateSortType]: handleUpdateSort,
  [UpdateQueriesType]: handleUpdateQueries,
  [UpdateSaveViewType]: handleSaveView,
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
  [FetchInvestigationSizeRequestType]: handleFetchSizeRequest,
  [FetchInvestigationSizeSuccessType]: handleFetchInvestigationSizeSuccess,
  [FetchInvestigationSizeFailureType]: handleFetchSizeFailure,
  [FetchDatasetCountRequestType]: handleFetchCountRequest,
  [FetchDatasetCountSuccessType]: handleFetchCountSuccess,
  [FetchDatasetCountFailureType]: handleFetchCountFailure,
  [FetchInvestigationDatasetsCountRequestType]: handleFetchDataCountRequest,
  [FetchInvestigationDatasetsCountSuccessType]: handleFetchDatasetCountSuccess,
  [FetchInvestigationDatasetsCountFailureType]: handleFetchDataCountFailure,
  [FetchDatasetSizeRequestType]: handleFetchSizeRequest,
  [FetchDatasetSizeSuccessType]: handleFetchDatasetSizeSuccess,
  [FetchDatasetSizeFailureType]: handleFetchSizeFailure,
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
  [FetchDatafileDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchDatafileDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchDatafileDetailsFailureType]: handleFetchDataDetailsFailure,
  [DownloadDatafileRequestType]: handleDownloadDataRequest,
  [DownloadDatafileSuccessType]: handleDownloadDataSuccess,
  [DownloadDatafileFailureType]: handleDownloadDataFailure,
  [FetchInstrumentsRequestType]: handleFetchDataRequest,
  [FetchInstrumentsSuccessType]: handleFetchDataSuccess,
  [FetchInstrumentsFailureType]: handleFetchDataFailure,
  [FetchInstrumentCountRequestType]: handleFetchCountRequest,
  [FetchInstrumentCountSuccessType]: handleFetchCountSuccess,
  [FetchInstrumentCountFailureType]: handleFetchCountFailure,
  [FetchInstrumentDetailsRequestType]: handleFetchDataDetailsRequest,
  [FetchInstrumentDetailsSuccessType]: handleFetchDataDetailsSuccess,
  [FetchInstrumentDetailsFailureType]: handleFetchDataDetailsFailure,
  [FetchFacilityCyclesRequestType]: handleFetchDataRequest,
  [FetchFacilityCyclesSuccessType]: handleFetchDataSuccess,
  [FetchFacilityCyclesFailureType]: handleFetchDataFailure,
  [FetchFacilityCycleCountRequestType]: handleFetchCountRequest,
  [FetchFacilityCycleCountSuccessType]: handleFetchCountSuccess,
  [FetchFacilityCycleCountFailureType]: handleFetchCountFailure,
  [FetchFacilityCyclesRequestType]: handleFetchDataRequest,
  [FetchFacilityCyclesSuccessType]: handleFetchDataSuccess,
  [FetchFacilityCyclesFailureType]: handleFetchDataFailure,
  [FetchDownloadCartRequestType]: handleDownloadCartRequest,
  [FetchDownloadCartSuccessType]: handleDownloadCartSuccess,
  [FetchDownloadCartFailureType]: handleDownloadCartFailure,
  [AddToCartRequestType]: handleDownloadCartRequest,
  [AddToCartSuccessType]: handleDownloadCartSuccess,
  [AddToCartFailureType]: handleDownloadCartFailure,
  [RemoveFromCartRequestType]: handleDownloadCartRequest,
  [RemoveFromCartSuccessType]: handleDownloadCartSuccess,
  [RemoveFromCartFailureType]: handleDownloadCartFailure,
  [FetchAllIdsRequestType]: handleFetchAllIdsRequest,
  [FetchAllIdsSuccessType]: handleFetchAllIdsSuccess,
  [FetchAllIdsFailureType]: handleFetchDataFailure,
  [FetchFilterRequestType]: handleFetchFilterRequest,
  [FetchFilterSuccessType]: handleFetchFilterSuccess,
  [FetchFilterFailureType]: handleFetchDataFailure,
});

export default dGCommonReducer;
