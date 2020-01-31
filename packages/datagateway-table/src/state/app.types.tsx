import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  Order,
  Filter,
  Entity,
  DownloadCartItem,
  DGCommonState,
} from 'datagateway-common';
import {
  FeatureSwitches,
  URLs,
  BreadcrumbSettings,
} from './actions/actions.types';

export interface DGTableState {
  res?: ApplicationStrings;
  features: FeatureSwitches;
  breadcrumbSettings: BreadcrumbSettings;
  settingsLoaded: boolean;
  facilityName: string;
    // sort: {
    //     [column: string]: Order;
    // };
    // filters: {
    //     [column: string]: Filter;
    // };
    // data: Entity[];
    // totalDataCount: number;
    // investigationCache: EntityCache;
    // datasetCache: EntityCache;
    // cartItems: DownloadCartItem[];
    // allIds: number[];
    // loading: boolean;
    // downloading: boolean;
    // error: string | null;
    // dataTimestamp: number;
    // countTimestamp: number;
    // allIdsTimestamp: number;
    // urls: URLs;
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
  dgtable: DGTableState;
} & DGCommonState;

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
