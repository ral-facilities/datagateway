import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DGCommonState } from 'datagateway-common';

export interface DGSearchState {
  searchText: string;
  text: string;
  selectDate: {
    startDate: MaterialUiPickersDate;
    endDate: MaterialUiPickersDate;
  };
  checkBox: {
    dataset: boolean;
    datafile: boolean;
    investigation: boolean;
  };
  requestSent: boolean;
  searchData: {
    dataset: any;
    datafile: any;
    investigation: any;
  };
}

export type StateType = {
  dgsearch: DGSearchState;
} & DGCommonState;

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
