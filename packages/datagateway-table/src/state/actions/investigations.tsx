import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchInvestigationDetailsRequestType,
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

export const fetchInvestigations = (
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());

    let params = getApiFilter(getState);
    const { investigationGetCount } = getState().dgtable.features;
    const { apiUrl } = getState().dgtable.urls;

    params.append(
      'include',
      JSON.stringify({ INVESTIGATIONINSTRUMENT: 'INSTRUMENT' })
    );

    if (additionalFilters) {
      additionalFilters.forEach(filter => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

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

export const fetchInvestigationDetailsSuccess = (
  investigations: Investigation[]
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInvestigationDetailsSuccessType,
  payload: {
    data: investigations,
  },
});

export const fetchInvestigationDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationDetailsRequest = (): Action => ({
  type: FetchInvestigationDetailsRequestType,
});

export const fetchInvestigationDetails = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    dispatch(fetchInvestigationDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: investigationId } }));
    params.append(
      'include',
      JSON.stringify([{ INVESTIGATIONUSER: 'USER_' }, 'SAMPLE', 'PUBLICATION'])
    );

    await axios
      .get(`/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationDetailsSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchInvestigationDetailsFailure(error.message));
      });
  };
};
