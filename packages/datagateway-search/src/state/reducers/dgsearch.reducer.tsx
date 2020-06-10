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
} from '../actions/actions.types';

export const initialState: DGSearchState = {
  searchText: '',
  text: '',
  selectDate: {
    startDate: null,
    endDate: null,
  },
  checkBox: {
    dataset: true,
    datafile: true,
    investigation: true,
  },
};

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

const DGSearchReducer = createReducer(initialState, {
  [ToggleDatasetType]: handleToggleDataset,
  [ToggleDatafileType]: handleToggleDatafile,
  [ToggleInvestigationType]: handleToggleInvestigation,
  [SelectStartDateType]: selectStartDate,
  [SelectEndDateType]: selectEndDate,
  [SearchTextType]: handleSearchText,
});

export default DGSearchReducer;
