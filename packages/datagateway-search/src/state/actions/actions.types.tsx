export const SetDatasetTabType = 'datagateway_search:set_dataset_tab';
export const SetDatafileTabType = 'datagateway_search:set_datafile_tab';
export const SetInvestigationTabType =
  'datagateway_search:set_investigation_tab';
export const SetCurrentTabType = 'datagateway_search:set_current_tab';
export const SettingsLoadedType = 'datagateway_search:settings_loaded';
export const ConfigureSearchableEntitiesType =
  'datagateway_search:configure_searchable_entities';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface CurrentTabPayload {
  currentTab: string;
}

export interface ConfigureSearchableEntitiesPayload {
  entities: string[];
}
