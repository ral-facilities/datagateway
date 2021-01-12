import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  SearchTextType,
  ToggleLuceneRequestReceivedType,
  StoreLuceneDatasetType,
  StoreLuceneDatafileType,
  StoreLuceneInvestigationType,
  TogglePayload,
  SelectDatePayload,
  SearchTextPayload,
  CheckRequestReceivedPayload,
  LuceneResultTypePayload,
  SetDatasetTabType,
  SetDatafileTabType,
  SetInvestigationTabType,
  CurrentTabPayload,
  SetCurrentTabType,
} from './actions.types';
import { ActionType } from '../app.types';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export const storeDatasetLucene = (
  searchData: number[]
): ActionType<LuceneResultTypePayload> => ({
  type: StoreLuceneDatasetType,
  payload: {
    searchData,
  },
});

export const storeDatafileLucene = (
  searchData: number[]
): ActionType<LuceneResultTypePayload> => ({
  type: StoreLuceneDatafileType,
  payload: {
    searchData,
  },
});

export const storeInvestigationLucene = (
  searchData: number[]
): ActionType<LuceneResultTypePayload> => ({
  type: StoreLuceneInvestigationType,
  payload: {
    searchData,
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

export const toggleLuceneRequestReceived = (
  requestReceived: boolean
): ActionType<CheckRequestReceivedPayload> => ({
  type: ToggleLuceneRequestReceivedType,
  payload: {
    requestReceived,
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

export const setCurrentTab = (
  currentTab: string
): ActionType<CurrentTabPayload> => ({
  type: SetCurrentTabType,
  payload: {
    currentTab,
  },
});
