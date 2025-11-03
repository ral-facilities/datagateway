import { DataviewSearchCommonSettings } from 'datagateway-common';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type SearchSettings = Optional<
  DataviewSearchCommonSettings,
  'accessMethods'
> & {
  searchableEntities?: string[];
  minNumResults?: number;
  maxNumResults?: number;
};

export let settings: Promise<SearchSettings | void>;
export const setSettings = (
  newSettings: Promise<SearchSettings | void>
): void => {
  settings = newSettings;
};
