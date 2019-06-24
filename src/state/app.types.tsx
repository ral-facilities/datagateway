import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface DGTableState {
  sort: {
    column: string;
    order: 'ASC' | 'DESC';
  } | null;
}

export interface StateType {
  dgtable: DGTableState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
