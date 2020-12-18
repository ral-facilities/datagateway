import { RouterState } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DownloadCartItem, Entity, FiltersType, SortType } from '../app.types';
import { URLs } from './actions/actions.types';

export interface DGCommonState {
  facilityName: string;
  urls: URLs;
  loading: boolean;
  downloading: boolean;
  error: string | null;
  data: Entity[];
  totalDataCount: number;
  investigationCache: EntityCache;
  datasetCache: EntityCache;
  cartItems: DownloadCartItem[];
  allIds: number[];
  dataTimestamp: number;
  countTimestamp: number;
  allIdsTimestamp: number;
  sort: SortType;
  filters: FiltersType;
  filterData: FilterDataType;
  query: QueryParams;
  savedView: SavedView;
}

export type ViewsType = 'table' | 'card' | null;

export interface QueryParams {
  view: ViewsType;
  search: string | null;
  page: number | null;
  results: number | null;
}

export interface SavedView {
  view: ViewsType;
  query: QueryParams | null;
  filters: FiltersType;
  sort: SortType;
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
