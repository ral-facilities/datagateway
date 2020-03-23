import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { DGCommonState } from 'datagateway-common';
import { FeatureSwitches, BreadcrumbSettings } from './actions/actions.types';

export interface DGDataViewState {
  res?: ApplicationStrings;
  features: FeatureSwitches;
  breadcrumbSettings: BreadcrumbSettings;
  settingsLoaded: boolean;
}

export interface EntityCache {
  [id: number]: {
    childEntityCount: number | null;
    childEntitySize: number | null;
  };
}

export interface AppStrings {
  [id: string]: string;
}

export interface ApplicationStrings {
  [section: string]: AppStrings;
}

export type StateType = {
  dgdataview: DGDataViewState;
} & DGCommonState;

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
