import {
  FetchStudiesSuccessType,
  FetchStudiesFailureType,
  FetchStudiesRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchCountSuccessPayload,
  FetchStudyCountSuccessType,
  FetchStudyCountFailureType,
  FetchStudyCountRequestType,
  RequestPayload,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import axios from 'axios';
import { getApiFilter } from '.';
import { StudyInvestigation } from '../../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

interface FetchStudiesParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  offsetParams?: IndexRange;
}

export const fetchStudiesSuccess = (
  studies: StudyInvestigation[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchStudiesSuccessType,
  payload: {
    data: studies,
    timestamp,
  },
});

export const fetchStudiesFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchStudiesFailureType,
  payload: {
    error,
  },
});

export const fetchStudiesRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchStudiesRequestType,
  payload: {
    timestamp,
  },
});

export const fetchStudies = (
  optionalParams?: FetchStudiesParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchStudiesRequest(timestamp));

    const params = getApiFilter(getState);
    const { apiUrl } = getState().dgcommon.urls;

    if (optionalParams && optionalParams.offsetParams) {
      params.append(
        'skip',
        JSON.stringify(optionalParams.offsetParams.startIndex)
      );
      params.append(
        'limit',
        JSON.stringify(
          optionalParams.offsetParams.stopIndex -
            optionalParams.offsetParams.startIndex +
            1
        )
      );
    }

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    await axios
      .get(`${apiUrl}/studyinvestigations`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchStudiesSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchStudiesFailure(error.message));
      });
  };
};

export const fetchStudyCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchStudyCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchStudyCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchStudyCountFailureType,
  payload: {
    error,
  },
});

export const fetchStudyCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchStudyCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchStudyCount = (
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchStudyCountRequest(timestamp));

    const params = getApiFilter(getState);
    params.delete('order');
    const { apiUrl } = getState().dgcommon.urls;

    if (additionalFilters) {
      additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    await axios
      .get(`${apiUrl}/studyinvestigations/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchStudyCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchStudyCountFailure(error.message));
      });
  };
};
