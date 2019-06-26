import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface DGTableState {
  sort: {
    column: string;
    order: 'ASC' | 'DESC';
  } | null;
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
  VISIT_ID: number;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INSTRUMENT: { NAME: string };
  STARTDATE: Date;
  ENDDATE: Date;
  [key: string]: string | number | Date | { NAME: string };
}
