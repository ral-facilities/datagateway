import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  SearchTextType,
  ToggleRequestSentType,
  StoreLuceneResultsType,
  // SearchResultType,
  TogglePayload,
  SelectDatePayload,
  SearchTextPayload,
  CheckRequestSentPayload,
  LuceneSearchResultPayload,
} from './actions.types';
import { ActionType } from '../app.types';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export const storeLuceneResults = (
  searchData: SearchResultType
): ActionType<LuceneSearchResultPayload> => ({
  type: StoreLuceneResultsType,
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

export const toggleRequestSent = (
  requestSent: boolean
): ActionType<CheckRequestSentPayload> => ({
  type: ToggleRequestSentType,
  payload: {
    requestSent,
  },
});
