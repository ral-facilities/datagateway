// internal actions
export const ConfigureBreadcrumbSettingsType =
  'datagateway_dataview:configure_breadcrumb';
export const ConfigurePluginHostSettingType =
  'datagateway_dataview:configure_plugin_host';
export const ConfigureFacilityImageSettingType =
  'datagateway_dataview:configure_facility_image';
export const SettingsLoadedType = 'datagateway_dataview:settings_loaded';

export interface ConfigureBreadcrumbSettingsPayload {
  settings: BreadcrumbSettings[];
}

export interface ConfigurePluginHostSettingPayload {
  settings: string;
}

export interface ConfigureFacilityImageSettingPayload {
  settings: string;
}

export interface BreadcrumbSettings {
  matchEntity: string;
  replaceEntityField: string;
  replaceEntityQueryField?: string;
  replaceEntity?: string;
  parentEntity?: string;
}
