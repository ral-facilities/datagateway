import { DGCommonState } from 'datagateway-common';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface DGSearchState {
  tabs: {
    datasetTab: boolean;
    datafileTab: boolean;
    investigationTab: boolean;
  };
  settingsLoaded: boolean;
  sideLayout: boolean;
  searchableEntities: string[];
  minNumResults: number;
  maxNumResults: number;
}

export type StateType = {
  dgsearch: DGSearchState;
} & DGCommonState;

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
