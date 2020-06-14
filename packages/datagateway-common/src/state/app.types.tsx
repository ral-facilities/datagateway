import { RouterState } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DownloadCartItem, Entity, Filter, Order } from '../app.types';
import { URLs } from './actions/actions.types';

export interface DGCommonState {
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
  urls: URLs;
  query: QueryParams;
  savedQueries: QueryParams | null;
  filterData: FilterDataType;
}

export type ViewsType = 'table' | 'card' | null;

export interface FiltersType {
  [filter: string]: {
    [value: string]: boolean;
  };
}

export interface QueryParams {
  view: ViewsType;
  page: number | null;
  results: number | null;
  filters: FiltersType | null;
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
