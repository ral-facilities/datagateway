import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { fetchLuceneData, LuceneSearchParams } from 'datagateway-common';
import { ActionType, ThunkResult } from '../app.types';
import {
  CheckRequestReceivedPayload,
  LuceneResultTypePayload,
  SearchTextPayload,
  SearchTextType,
  SelectDatePayload,
  SelectEndDateType,
  SelectStartDateType,
  SetDatafileTabType,
  SetDatasetTabType,
  SetInvestigationTabType,
  StoreLuceneDatafileType,
  StoreLuceneDatasetType,
  StoreLuceneInvestigationType,
  ToggleDatafileType,
  ToggleDatasetType,
  ToggleInvestigationType,
  ToggleLuceneRequestReceivedType,
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

export const toggleLuceneRequestReceived = (
  requestReceived: boolean
): ActionType<CheckRequestReceivedPayload> => ({
  type: ToggleLuceneRequestReceivedType,
  payload: {
    requestReceived,
  },
});

export const fetchLuceneInvestigations = (
  params: LuceneSearchParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const { downloadApiUrl } = getState().dgcommon.urls;

    await fetchLuceneData('Investigation', params, {
      downloadApiUrl,
    }).then((results) => {
      dispatch(storeInvestigationLucene(results));
      dispatch(toggleLuceneRequestReceived(true));
    });
  };
};

export const fetchLuceneDatasets = (
  params: LuceneSearchParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const { downloadApiUrl } = getState().dgcommon.urls;

    await fetchLuceneData('Dataset', params, {
      downloadApiUrl,
    }).then((results) => {
      dispatch(storeDatasetLucene(results));
      dispatch(toggleLuceneRequestReceived(true));
    });
  };
};

export const fetchLuceneDatafiles = (
  params: LuceneSearchParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const { downloadApiUrl } = getState().dgcommon.urls;

    await fetchLuceneData('Datafile', params, {
      downloadApiUrl,
    }).then((results) => {
      dispatch(storeDatafileLucene(results));
      dispatch(toggleLuceneRequestReceived(true));
    });
  };
};
export const setCurrentTab = (
  currentTab: string
): ActionType<CurrentTabPayload> => ({
  type: SetCurrentTabType,
  payload: {
    currentTab,
  },
});
