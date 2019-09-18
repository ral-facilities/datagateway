import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Order, Filter, Entity } from 'datagateway-common';

export interface DGTableState {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  downloading: boolean;
  error: string | null;
}

export interface StateType {
  dgtable: DGTableState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
