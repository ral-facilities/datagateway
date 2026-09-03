import type { DGCommonState } from 'datagateway-common';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
import type { DatafilePreviewerState } from '../views/datafilePreview/state/reducer';
import type { BreadcrumbSettings } from './actions/actions.types';

export interface DGDataViewState {
  facilityImageURL: string;
  landingPageLogo?: 'STFC' | 'DLS' | string;
  breadcrumbSettings: BreadcrumbSettings[];
  settingsLoaded: boolean;
  pluginHost: string;
  datafilePreviewer: DatafilePreviewerState;
  PIRole: string;
  localContactRole: string;
  uiFeatures: {
    disableContributor: boolean;
  };
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
