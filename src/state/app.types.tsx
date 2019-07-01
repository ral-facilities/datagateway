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
  data: Entity[];
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

// TODO: type entities properly
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

export interface Dataset {
  ID: string;
  NAME: string;
  MOD_TIME: string;
  CREATE_TIME: string;
  INVESTIGATION_ID: number;
  [key: string]: string | number;
}

export interface Datafile {
  ID: string;
  NAME: string;
  LOCATION: string;
  SIZE: number;
  MOD_TIME: string;
  DATASET_ID: number;
  [key: string]: string | number;
}

export type Entity = Investigation | Dataset | Datafile;

// TODO: type this properly
export type Filter = string | number;

export type Order = 'asc' | 'desc';
