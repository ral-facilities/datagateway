import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import axios from 'axios';
import { format } from 'date-fns';
import handleICATError from '../../handleICATError';
import { readSciGatewayToken } from '../../parseTokens';
import { ActionType, ThunkResult } from '../app.types';
import {
  FailurePayload,
  FetchIdsSuccessPayload,
  FetchLuceneIdsFailureType,
  FetchLuceneIdsRequestType,
  FetchLuceneIdsSuccessType,
  RequestPayload,
} from './actions.types';

interface QueryParameters {
  target: string;
  text?: string;
  lower?: string;
  upper?: string;
}

export type DatasearchType = 'Investigation' | 'Dataset' | 'Datafile';

export type LuceneSearchParams = UrlBuilderParameters & {
  maxCount?: number;
};

interface UrlBuilderParameters {
  searchText: string;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
}

const urlParamsBuilder = (
  datasearchtype: DatasearchType,
  params: UrlBuilderParameters
): QueryParameters => {
  const query: QueryParameters = {
    target: datasearchtype,
  };

  const stringStartDate =
    params.startDate !== null
      ? format(params.startDate, 'yyyy-MM-dd')
      : '00000-01-01';
  const stringStartDateArray = stringStartDate.split('-');
  query.lower =
    stringStartDateArray[0] +
    stringStartDateArray[1] +
    stringStartDateArray[2] +
    '0000';

  const stringEndDate =
    params.endDate !== null
      ? format(params.endDate, 'yyyy-MM-dd')
      : '90000-12-31';
  const stringEndDateArray = stringEndDate.split('-');
  query.upper =
    stringEndDateArray[0] +
    stringEndDateArray[1] +
    stringEndDateArray[2] +
    '2359';

  if (params.searchText.length > 0) {
    query.text = params.searchText;
  }

  // return query.
  return query;
};

export const fetchLuceneData = async (
  datasearchType: DatasearchType,
  params: LuceneSearchParams,
  settings: {
    icatUrl: string;
  }
): Promise<number[]> => {
  // Query params.
  const queryParams = {
    sessionId: readSciGatewayToken().sessionId,
    query: urlParamsBuilder(datasearchType, params),
    // Default maximum count is 300.
    maxCount: params.maxCount ? params.maxCount : 300,
  };

  let results = [];
  results = await axios
    .get(`${settings.icatUrl}/lucene/data`, {
      params: queryParams,
    })
    .then((response) => {
      // Dispatch action to save the result IDs.
      return response.data.map((result: { id: number }) => result.id);
    });

  return results;
};

export const fetchLuceneIdsSuccess = (
  luceneIds: number[],
  timestamp: number
): ActionType<FetchIdsSuccessPayload> => ({
  type: FetchLuceneIdsSuccessType,
  payload: {
    data: luceneIds,
    timestamp,
  },
});

export const fetchLuceneIdsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchLuceneIdsFailureType,
  payload: {
    error,
  },
});

export const fetchLuceneIdsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchLuceneIdsRequestType,
  payload: {
    timestamp,
  },
});

export const fetchLuceneIds = (
  datasearchType: DatasearchType,
  params: LuceneSearchParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const { icatUrl } = getState().dgcommon.urls;

    const timestamp = Date.now();
    dispatch(fetchLuceneIdsRequest(timestamp));

    await fetchLuceneData(datasearchType, params, {
      icatUrl,
    })
      .then((results) => {
        dispatch(fetchLuceneIdsSuccess(results, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchLuceneIdsFailure(error.message));
      });
  };
};
