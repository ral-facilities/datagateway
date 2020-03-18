import { ApplicationStrings } from '../app.types';

// internal actions
export const ConfigureStringsType = 'datagateway_dataview:configure_strings';
export const ConfigureFeatureSwitchesType =
  'datagateway_dataview:configure_feature_switches';
export const ConfigureBreadcrumbSettingsType =
  'datagateway_dataview:configure_breadcrumb';
export const SettingsLoadedType = 'datagateway_dataview:settings_loaded';

export interface ConfigureStringsPayload {
  res: ApplicationStrings;
}

export interface FeatureSwitchesPayload {
  switches: FeatureSwitches;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeatureSwitches {}

export interface ConfigureBreadcrumbSettingsPayload {
  settings: BreadcrumbSettings;
}

export interface BreadcrumbSettings {
  [matchEntity: string]: {
    replaceEntityField: string;
    replaceEntity?: string;
    parentEntity?: string;
  };
}
