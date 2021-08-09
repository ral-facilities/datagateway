import { RouterState } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { URLs } from './actions/actions.types';

export interface DGCommonState {
  facilityName: string;
  urls: URLs;
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
