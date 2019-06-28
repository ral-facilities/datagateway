import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface DGTableState {
  sort?: {
    column: string;
    order: Order;
  };
  filters?: {
    [column: string]: Filter;
  };
  data: Investigation[];
  loading: boolean;
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

export interface Investigation {
  ID: string;
  TITLE: string;
  VISIT_ID: string;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INSTRUMENT: { NAME: string };
  STARTDATE: string;
  ENDDATE: string;
  [key: string]: string | number | { NAME: string };
}

// TODO: type this properly
export type Filter = string;

export type Order = 'asc' | 'desc';
