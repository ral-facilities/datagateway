import { DGSearchState } from '../app.types';
import createReducer from './createReducer';
import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  SearchTextType,
  ToggleRequestSentType,
  TogglePayload,
  SelectDatePayload,
  SearchTextPayload,
  CheckRequestSentPayload,
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
  requestSent: false,
  searchData: null,
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

export function toggleRequestSent(
  state: DGSearchState,
  payload: CheckRequestSentPayload
): DGSearchState {
  return {
    ...state,
    requestSent: payload.requestSent,
  };
}

const DGSearchReducer = createReducer(initialState, {
  [ToggleDatasetType]: handleToggleDataset,
  [ToggleDatafileType]: handleToggleDatafile,
  [ToggleInvestigationType]: handleToggleInvestigation,
  [SelectStartDateType]: selectStartDate,
  [SelectEndDateType]: selectEndDate,
  [SearchTextType]: handleSearchText,
  [ToggleRequestSentType]: toggleRequestSent,
});

export default DGSearchReducer;
