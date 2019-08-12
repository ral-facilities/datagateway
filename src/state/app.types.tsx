import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RouterState } from 'connected-react-router';

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
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;

// TODO: type entities properly
export interface Investigation {
  ID: number;
  TITLE: string;
  VISIT_ID: string;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INSTRUMENT: { NAME: string };
  STARTDATE: string;
  ENDDATE: string;
  DATASET_COUNT?: number;
  [key: string]: string | number | { NAME: string } | undefined;
}

export interface Dataset {
  ID: number;
  NAME: string;
  MOD_TIME: string;
  CREATE_TIME: string;
  INVESTIGATION_ID: number;
  DATAFILE_COUNT?: number;
  [key: string]: string | number | undefined;
}

export interface Datafile {
  ID: number;
  NAME: string;
  LOCATION: string;
  SIZE: number;
  MOD_TIME: string;
  DATASET_ID: number;
  [key: string]: string | number;
}

export interface Instrument {
  ID: number;
  NAME: string;
}

export interface FacilityCycle {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  STARTDATE: string;
  ENDDATE: string;
}

export type Entity =
  | Investigation
  | Dataset
  | Datafile
  | Instrument
  | FacilityCycle;

// TODO: type this properly
export type Filter = string | number;

export type Order = 'asc' | 'desc';
