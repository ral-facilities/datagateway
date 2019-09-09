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

interface FetchInvestigationsParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  getDatasetCount?: boolean;
  getSize?: boolean;
}

export const fetchInvestigations = (
  optionalParams?: FetchInvestigationsParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());

    let params = getApiFilter(getState);
    const { apiUrl } = getState().dgtable.urls;

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach(filter => {
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
        if (optionalParams && optionalParams.getDatasetCount) {
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

export const fetchISISInvestigations = (
  instrumentId: string,
  facilityCycleId: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationsRequest());

    // TODO: replace this with getApiFilters again when API filter change merges in
    const sort = getState().dgtable.sort;
    const filter = getState().dgtable.filters;

    let params = new URLSearchParams();
    for (let [key, value] of Object.entries(sort)) {
      params.append('order', JSON.stringify(`${key} ${value}`));
    }

    for (let [key, value] of Object.entries(filter)) {
      params.append('where', JSON.stringify({ [key]: { like: value } }));
    }

    params.append(
      'include',
      JSON.stringify([
        { INVESTIGATIONINSTRUMENT: 'INSTRUMENT' },
        { STUDYINVESTIGATION: 'STUDY' },
      ])
    );

    await axios
      .get(
        `/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations`,
        {
          params,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem(
              'daaas:token'
            )}`,
          },
        }
      )
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data));
        // TODO: dispatch getSize requests
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
