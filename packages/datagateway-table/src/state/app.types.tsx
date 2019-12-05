import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Order, Filter, Entity, DownloadCartItem } from 'datagateway-common';
import {
  FeatureSwitches,
  URLs,
  BreadcrumbSettings,
} from './actions/actions.types';
import { RouterState } from 'connected-react-router';

export interface DGTableState {
  facilityName: string;
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  totalDataCount: number;
  investigationCache: EntityCache;
  datasetCache: EntityCache;
  cartItems: DownloadCartItem[];
  allIds: number[];
  loading: boolean;
  downloading: boolean;
  error: string | null;
  dataTimestamp: number;
  countTimestamp: number;
  allIdsTimestamp: number;
  res?: ApplicationStrings;
  features: FeatureSwitches;
  urls: URLs;
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

export interface StateType {
  dgtable: DGTableState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
