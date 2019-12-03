import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export interface DGSearchState {
  selectDate: {
    date: MaterialUiPickersDate;
    startdate: MaterialUiPickersDate; // not sure if this should be date type instead
    enddate: MaterialUiPickersDate;
  };
  checkBox: {
    dataset: boolean;
    datafile: boolean;
    investigation: boolean;
  };
}

export interface StateType {
  dgsearch: DGSearchState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
