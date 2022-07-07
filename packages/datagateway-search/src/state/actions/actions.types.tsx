export const SetDatasetTabType = 'datagateway_search:set_dataset_tab';
export const SetDatafileTabType = 'datagateway_search:set_datafile_tab';
export const SetInvestigationTabType =
  'datagateway_search:set_investigation_tab';

export const SettingsLoadedType = 'datagateway_search:settings_loaded';
export const ConfigureSelectAllSettingType =
  'datagateway_search:configure_select_all';
export const ConfigureSearchableEntitiesType =
  'datagateway_search:configure_searchable_entities';
export const ConfigureMinNumResultsType =
  'datagateway_search:configure_min_num_results';
export const ConfigureMaxNumResultsType =
  'datagateway_search:configure_max_num_results';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface ConfigureSelectAllSettingPayload {
  settings: boolean;
}

export interface ConfigureSearchableEntitiesPayload {
  entities: string[];
}

export interface ConfigureMinNumResultsPayload {
  minNumResults: number;
}

export interface ConfigureMaxNumResultsPayload {
  maxNumResults: number;
}
