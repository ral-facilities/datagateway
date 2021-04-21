import { HomepageContents } from 'datagateway-common/src/app.types';

// internal actions
export const ConfigureFeatureSwitchesType =
  'datagateway_dataview:configure_feature_switches';
export const ConfigureBreadcrumbSettingsType =
  'datagateway_dataview:configure_breadcrumb';
export const ConfigureSelectAllSettingType =
  'datagateway_dataview:configure_select_all';
export const SettingsLoadedType = 'datagateway_dataview:settings_loaded';
export const ConfigureHomepageStringsType =
  'datagateway_dataview:homepage_strings_loaded';

export interface FeatureSwitchesPayload {
  switches: FeatureSwitches;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeatureSwitches {}

export interface ConfigureBreadcrumbSettingsPayload {
  settings: BreadcrumbSettings;
}
export interface ConfigureSelectAllSettingPayload {
  settings: boolean;
}

export interface BreadcrumbSettings {
  [matchEntity: string]: {
    replaceEntityField: string;
    replaceEntity?: string;
    parentEntity?: string;
  };
}

export interface ConfigureHomepageStringsPayload {
  res: HomepageContents;
}
