import {
  FetchDatafilesSuccessType,
  FetchDatafilesSuccessPayload,
  FetchDatafilesFailureType,
  FetchDatafilesFailurePayload,
  FetchDatafilesRequestType,
} from './actions.types';
import { Datafile, ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { getApiFilter } from '.';

export const fetchDatafilesSuccess = (
  datafiles: Datafile[]
): ActionType<FetchDatafilesSuccessPayload> => ({
  type: FetchDatafilesSuccessType,
  payload: {
    datafiles,
  },
});

export const fetchDatafilesFailure = (
  error: string
): ActionType<FetchDatafilesFailurePayload> => ({
  type: FetchDatafilesFailureType,
  payload: {
    error,
  },
});

export const fetchDatafilesRequest = (): Action => ({
  type: FetchDatafilesRequestType,
});

export const fetchDatafiles = (
  datasetId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDatafilesRequest());

    let filter = getApiFilter(getState);
    filter.where = {
      ...filter.where,
      DATASET_ID: datasetId,
    };

    const params = {
      filter,
    };

    await axios
      .get('/datafiles', {
        params,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        dispatch(fetchDatafilesSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchDatafilesFailure(error.message));
      });
  };
};
