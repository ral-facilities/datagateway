import { DOISettings, DataviewSearchCommonSettings } from 'datagateway-common';
import { BreadcrumbSettings } from './state/actions/actions.types';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type DataviewSettings = Optional<
  DataviewSearchCommonSettings,
  'accessMethods'
> &
  DOISettings & {
    facilityImageURL?: string;
    breadcrumbs?: BreadcrumbSettings[];
  };

export let settings: Promise<DataviewSettings | void>;
export const setSettings = (
  newSettings: Promise<DataviewSettings | void>
): void => {
  settings = newSettings;
};
