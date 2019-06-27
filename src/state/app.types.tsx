import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface DGTableState {
  sort: {
    column: string;
    order: 'asc' | 'desc';
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
  VISIT_ID: string;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INSTRUMENT: { NAME: string };
  STARTDATE: string;
  ENDDATE: string;
  [key: string]: string | number | { NAME: string };
}

// TODO: actually type this properly
export interface Filter {
  where?: string;
  order?: string;
  limit?: string;
  skip?: string;
  include?: string;
}
