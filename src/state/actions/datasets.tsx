import {
  FetchDatasetsSuccessType,
  FetchDatasetsSuccessPayload,
  FetchDatasetsFailureType,
  FetchDatasetsFailurePayload,
  FetchDatasetsRequestType,
} from './actions.types';
import { Dataset, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';

export const fetchDatasetsSuccess = (
  datasets: Dataset[]
): ActionType<FetchDatasetsSuccessPayload> => ({
  type: FetchDatasetsSuccessType,
  payload: {
    datasets,
  },
});

export const fetchDatasetsFailure = (
  error: string
): ActionType<FetchDatasetsFailurePayload> => ({
  type: FetchDatasetsFailureType,
  payload: {
    error,
  },
});

export const fetchDatasetsRequest = (): Action => ({
  type: FetchDatasetsRequestType,
});

export const fetchDatasets = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatasetsRequest());

    let filter = getApiFilter(getState);
    filter.where = {
      ...filter.where,
      INVESTIGATION_ID: investigationId,
    };

    const params = {
      filter,
    };

    await axios
      .get('/datasets', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatasetsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchDatasetsFailure(error.message));
      });
  };
};
