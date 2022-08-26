import type { ThunkAction } from 'redux-thunk';
import type { AnyAction } from 'redux';
import type { DGCommonState } from 'datagateway-common';
import type { DatafilePreviewerState } from '../views/datafilePreview/state/reducer';
import type {
  FeatureSwitches,
  BreadcrumbSettings,
} from './actions/actions.types';

export interface DGDataViewState {
  facilityImageURL: string;
  features: FeatureSwitches;
  breadcrumbSettings: BreadcrumbSettings;
  settingsLoaded: boolean;
  selectAllSetting: boolean;
  pluginHost: string;
  datafilePreviewer: DatafilePreviewerState;
}

export interface EntityCache {
  [id: number]: {
    childEntityCount: number | null;
    childEntitySize: number | null;
  };
}

export type StateType = {
  dgdataview: DGDataViewState;
} & DGCommonState;

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
