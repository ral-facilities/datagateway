import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchDatasetCount } from './datasets';
import * as log from 'loglevel';
import { Investigation } from 'datagateway-common';

export const fetchInvestigationsSuccess = (
  investigations: Investigation[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInvestigationsSuccessType,
  payload: {
    data: investigations,
  },
});

export const fetchInvestigationsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationsRequest = (): Action => ({
  type: FetchInvestigationsRequestType,
});

export const fetchInvestigations = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());

    let params = getApiFilter(getState);
    const { investigationGetCount } = getState().dgtable.features;
    const { apiUrl } = getState().dgtable.urls;

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data));
        if (investigationGetCount) {
          response.data.forEach((investigation: Investigation) => {
            dispatch(fetchDatasetCount(investigation.ID));
          });
        }
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};
