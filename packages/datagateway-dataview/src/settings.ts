import { PluginRoute } from 'datagateway-common';
import { BreadcrumbSettings } from './state/actions/actions.types';

export interface DataviewSettings {
  facilityName: string;
  apiUrl: string;
  downloadApiUrl: string;
  idsUrl: string;
  selectAllSetting?: boolean;
  facilityImageURL?: string;
  features?: never;
  breadcrumbs?: BreadcrumbSettings;
  routes: PluginRoute[];
  helpSteps?: { target: string; content: string }[];
  pluginHost?: string;
}

export let settings: Promise<DataviewSettings | void>;
export const setSettings = (
  newSettings: Promise<DataviewSettings | void>
): void => {
  settings = newSettings;
};
