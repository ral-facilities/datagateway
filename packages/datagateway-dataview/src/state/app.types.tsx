import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { DGCommonState } from 'datagateway-common';
import { HomepageContents } from 'datagateway-common/src/app.types';
import { FeatureSwitches, BreadcrumbSettings } from './actions/actions.types';

export interface DGDataViewState {
  features: FeatureSwitches;
  breadcrumbSettings: BreadcrumbSettings;
  settingsLoaded: boolean;
  selectAllSetting: boolean;
  res?: HomepageContents;
  pluginHostUrl: string;
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
