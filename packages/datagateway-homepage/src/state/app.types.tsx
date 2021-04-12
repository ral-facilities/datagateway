import { RouterState } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface DGHomepageState {
  facilityName: string;
  loading: boolean;
  loadedData: boolean;
  error: string | null;
  darkMode: boolean;
  res?: ApplicationStrings;
}

export type ViewsType = 'table' | 'card' | null;

export interface AppStrings {
  [id: string]: string;
}

export interface ApplicationStrings {
  [section: string]: AppStrings;
}

export interface StateType {
  dghomepage: DGHomepageState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
