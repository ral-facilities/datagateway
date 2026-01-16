import { DOISettings, DataviewSearchCommonSettings } from 'datagateway-common';
import { BreadcrumbSettings } from './state/actions/actions.types';

export type DataviewSettings = DataviewSearchCommonSettings &
  DOISettings & {
    facilityImageURL?: string;
    breadcrumbs?: BreadcrumbSettings[];
    PIRole?: string;
  };

export let settings: Promise<DataviewSettings | void>;
export const setSettings = (
  newSettings: Promise<DataviewSettings | void>
): void => {
  settings = newSettings;
};
