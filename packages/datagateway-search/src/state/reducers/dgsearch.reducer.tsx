import { DGSearchState } from '../app.types';
import createReducer from './createReducer';
import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  TogglePayload,
  SelectDatePayload,
} from '../actions/actions.types';
import { string } from 'prop-types';

export const initialState: DGSearchState = {
  selectDate: {
    startdate: Date.parse('1990-12-12'), // Have made up a value. What is the earliest data on system?
    enddate: Date.now(),
  },
  checkBox: {
    dataset: true,
    datafile: true,
    investigation: true,
  },
};

export function handleToggleDataset(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      dataset: payload.toggleoption,
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
      datafile: payload.toggleoption,
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
      investigation: payload.toggleoption,
    },
  };
}

export function SelectStartDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      startdate: payload.date,
  },
  };
}

export function SelectEndDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      enddate: payload.date,
  },
  };
}

const DGSearchReducer = createReducer(initialState, {
  [ToggleDatasetType]: handleToggleDataset,
  [ToggleDatafileType]: handleToggleDatafile,
  [ToggleInvestigationType]: handleToggleInvestigation,
  [SelectStartDateType]: SelectStartDate,
  [SelectEndDateType]: SelectEndDate,
});

export default DGSearchReducer;
