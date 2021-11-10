export const SetDatasetTabType = 'datagateway_search:set_dataset_tab';
export const SetDatafileTabType = 'datagateway_search:set_datafile_tab';
export const SetInvestigationTabType =
  'datagateway_search:set_investigation_tab';
export const SetCurrentTabType = 'datagateway_search:set_current_tab';
export const SettingsLoadedType = 'datagateway_search:settings_loaded';
export const ConfigureSelectAllSettingType =
  'datagateway_search:configure_select_all';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface CurrentTabPayload {
  currentTab: string;
}

export interface ConfigureSelectAllSettingPayload {
  settings: boolean;
}
