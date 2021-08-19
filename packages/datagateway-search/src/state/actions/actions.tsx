import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { ActionType } from '../app.types';
import {
  SearchTextPayload,
  SearchTextType,
  SelectDatePayload,
  SelectEndDateType,
  SelectStartDateType,
  SetDatafileTabType,
  SetDatasetTabType,
  SetInvestigationTabType,
  ToggleDatafileType,
  ToggleDatasetType,
  ToggleInvestigationType,
  TogglePayload,
  CurrentTabPayload,
  SetCurrentTabType,
} from './actions.types';

export const toggleDataset = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleDatasetType,
  payload: {
    toggleOption,
  },
});

export const toggleDatafile = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleDatafileType,
  payload: {
    toggleOption,
  },
});

export const toggleInvestigation = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleInvestigationType,
  payload: {
    toggleOption,
  },
});

export const selectStartDate = (
  date: MaterialUiPickersDate
): ActionType<SelectDatePayload> => ({
  type: SelectStartDateType,
  payload: {
    date,
  },
});

export const selectEndDate = (
  date: MaterialUiPickersDate
): ActionType<SelectDatePayload> => ({
  type: SelectEndDateType,
  payload: {
    date,
  },
});

export const setDatasetTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetDatasetTabType,
  payload: {
    toggleOption,
  },
});

export const setDatafileTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetDatafileTabType,
  payload: {
    toggleOption,
  },
});

export const setInvestigationTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetInvestigationTabType,
  payload: {
    toggleOption,
  },
});

export const submitSearchText = (
  searchText: string
): ActionType<SearchTextPayload> => ({
  type: SearchTextType,
  payload: {
    searchText,
  },
});

export const setCurrentTab = (
  currentTab: string
): ActionType<CurrentTabPayload> => ({
  type: SetCurrentTabType,
  payload: {
    currentTab,
  },
});
