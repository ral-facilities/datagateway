import { PluginRoute } from 'datagateway-common';

export interface SearchSettings {
  facilityName: string;
  apiUrl: string;
  downloadApiUrl: string;
  idsUrl: string;
  icatUrl: string;
  selectAllSetting?: boolean;
  searchableEntities?: string[];
  minNumResults?: number;
  maxNumResults?: number;
  routes: PluginRoute[];
  helpSteps?: { target: string; content: string }[];
  pluginHost?: string;
}

export let settings: Promise<SearchSettings | void>;
export const setSettings = (
  newSettings: Promise<SearchSettings | void>
): void => {
  settings = newSettings;
};
