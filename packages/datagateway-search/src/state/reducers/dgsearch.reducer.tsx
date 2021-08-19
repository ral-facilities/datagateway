import { DGSearchState } from '../app.types';
import { createReducer } from 'datagateway-common';
import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  SearchTextType,
  TogglePayload,
  SelectDatePayload,
  SearchTextPayload,
  SetDatasetTabType,
  SetDatafileTabType,
  SetInvestigationTabType,
  SettingsLoadedType,
  CurrentTabPayload,
  SetCurrentTabType,
} from '../actions/actions.types';

export const initialState: DGSearchState = {
  searchText: '',
  selectDate: {
    startDate: null,
    endDate: null,
  },
  checkBox: {
    dataset: true,
    datafile: true,
    investigation: true,
  },
  tabs: {
    datasetTab: false,
    datafileTab: false,
    investigationTab: false,
    currentTab: 'investigation',
  },
  settingsLoaded: false,
  sideLayout: false,
};

export function handleSettingsLoaded(state: DGSearchState): DGSearchState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleSearchText(
  state: DGSearchState,
  payload: SearchTextPayload
): DGSearchState {
  return {
    ...state,
    searchText: payload.searchText,
  };
}

export function handleToggleDataset(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      dataset: payload.toggleOption,
    },
  };
}

export function handleToggleDatafile(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      datafile: payload.toggleOption,
    },
  };
}

export function handleToggleInvestigation(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      investigation: payload.toggleOption,
    },
  };
}

export function selectStartDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      startDate: payload.date,
    },
  };
}

export function selectEndDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      endDate: payload.date,
    },
  };
}

export function handleSetDatasetTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      datasetTab: payload.toggleOption,
    },
  };
}

export function handleSetDatafileTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      datafileTab: payload.toggleOption,
    },
  };
}

export function handleSetInvestigationTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      investigationTab: payload.toggleOption,
    },
  };
}

export function handleSetCurrentTab(
  state: DGSearchState,
  payload: CurrentTabPayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      currentTab: payload.currentTab,
    },
  };
}

const DGSearchReducer = createReducer(initialState, {
  [ToggleDatasetType]: handleToggleDataset,
  [ToggleDatafileType]: handleToggleDatafile,
  [ToggleInvestigationType]: handleToggleInvestigation,
  [SelectStartDateType]: selectStartDate,
  [SelectEndDateType]: selectEndDate,
  [SearchTextType]: handleSearchText,
  [SetDatasetTabType]: handleSetDatasetTab,
  [SetDatafileTabType]: handleSetDatafileTab,
  [SetInvestigationTabType]: handleSetInvestigationTab,
  [SettingsLoadedType]: handleSettingsLoaded,
  [SetCurrentTabType]: handleSetCurrentTab,
});

export default DGSearchReducer;
