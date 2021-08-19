import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export const SearchTextType = 'datagateway_search:input_text';
export const ToggleDatasetType = 'datagateway_search:toggle_dataset';
export const ToggleDatafileType = 'datagateway_search:toggle_datafile';
export const ToggleInvestigationType =
  'datagateway_search:toggle_investigation';
export const SelectStartDateType = 'datagateway_search:select_startdate';
export const SelectEndDateType = 'datagateway_search:select_enddate';
export const SetDatasetTabType = 'datagateway_search:set_dataset_tab';
export const SetDatafileTabType = 'datagateway_search:set_datafile_tab';
export const SetInvestigationTabType =
  'datagateway_search:set_investigation_tab';
export const SetCurrentTabType = 'datagateway_search:set_current_tab';
export const SettingsLoadedType = 'datagateway_search:settings_loaded';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface SelectDatePayload {
  date: MaterialUiPickersDate;
}

export interface SearchTextPayload {
  searchText: string;
}

export interface CurrentTabPayload {
  currentTab: string;
}
