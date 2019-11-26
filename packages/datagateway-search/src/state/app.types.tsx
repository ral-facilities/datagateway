import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface DGSearchState {
  startDate: number;  // not sure if this should be date type instead
  endDate: number;
  checkBox: {
    dataset: boolean;
    datafile: boolean;
    investigation: boolean;
  }
}

export interface StateType {
  dgsearch: DGSearchState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;