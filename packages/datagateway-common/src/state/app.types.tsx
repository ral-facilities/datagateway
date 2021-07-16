import { RouterState } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DownloadCartItem, Entity, QueryParams } from '../app.types';
import { URLs } from './actions/actions.types';

export interface DGCommonState {
  facilityName: string;
  urls: URLs;
  loading: boolean;
  loadedData: boolean;
  loadedCount: boolean;
  downloading: boolean;
  error: string | null;
  data: Entity[];
  totalDataCount: number;
  investigationCache: EntityCache;
  datasetCache: EntityCache;
  cartItems: DownloadCartItem[];
  allIds: number[];
  luceneIds: number[];
  luceneIdsTimestamp: number;
  dataTimestamp: number;
  countTimestamp: number;
  allIdsTimestamp: number;
  filterData: FilterDataType;
  query: QueryParams;
  savedQuery: QueryParams;
}

export interface FilterDataType {
  [filterKey: string]: string[];
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
  dgcommon: DGCommonState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
