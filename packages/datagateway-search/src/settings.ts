import { DOISettings, DataviewSearchCommonSettings } from 'datagateway-common';

export type SearchSettings = DataviewSearchCommonSettings &
  Pick<DOISettings, 'doiHandleUrl'> & {
    searchableEntities?: string[];
    minNumResults?: number;
    maxNumResults?: number;
    searchFields: string[];
    searchUrl: string;
  };

export let settings: Promise<SearchSettings | void>;
export const setSettings = (
  newSettings: Promise<SearchSettings | void>
): void => {
  settings = newSettings;
};
