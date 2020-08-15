import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import axios from 'axios';
import { format } from 'date-fns';
import { handleICATError, readSciGatewayToken } from '../..';
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

// TODO: Do we need this?
// interface RequestParameters {
//   sessionId: string | null;
//   maxCount: number;
// }

// TODO: Do we need this?
// type LuceneParameters = QueryParameters | RequestParameters;

export type DatasearchType = 'Investigation' | 'Dataset' | 'Datafile';

export type LuceneSearchParams = UrlBuilderParameters & {
  maxCount?: number;
};

interface UrlBuilderParameters {
  searchText: string;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
}

// TODO: Move this out of here.
// arguments: startDate, endDate, searchText
const urlParamsBuilder = (
  datasearchtype: DatasearchType,
  params: UrlBuilderParameters
): QueryParameters => {
  let stringStartDate = '';
  if (params.startDate !== null) {
    stringStartDate = format(params.startDate, 'yyyy-MM-dd');
    const stringStartDateArray = stringStartDate.split('-');
    stringStartDate =
      stringStartDateArray[0] +
      stringStartDateArray[1] +
      stringStartDateArray[2] +
      '0000';
  }

  let stringEndDate = '';
  if (params.endDate !== null) {
    stringEndDate = format(params.endDate, 'yyyy-MM-dd');
    const stringEndDateArray = stringEndDate.split('-');
    stringEndDate =
      stringEndDateArray[0] +
      stringEndDateArray[1] +
      stringEndDateArray[2] +
      '2359';
  }

  const query: QueryParameters = {
    target: datasearchtype,
  };

  if (params.searchText.length > 0) {
    query.text = params.searchText;
  }

  if (stringStartDate.length > 0) {
    query.lower = stringStartDate;
  }

  if (stringEndDate.length > 0) {
    query.upper = stringEndDate;
  }

  // return query.
  return query;
};

export const fetchLuceneData = async (
  datasearchType: DatasearchType,
  params: LuceneSearchParams,
  settings: {
    downloadApiUrl: string;
  }
): Promise<number[]> => {
  // Create ICAT url.
  const splitUrl = settings.downloadApiUrl.split('/');
  const icatUrl = `${splitUrl.slice(0, splitUrl.length - 1).join('/')}/icat`;

  // Query params.
  const queryParams = {
    sessionId: readSciGatewayToken().sessionId,
    query: urlParamsBuilder(datasearchType, params),
    // Default maximum count is 300.
    maxCount: params.maxCount ? params.maxCount : 300,
  };

  let results = [];
  results = await axios
    .get(`${icatUrl}/lucene/data`, {
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
    const { downloadApiUrl } = getState().dgcommon.urls;

    const timestamp = Date.now();
    dispatch(fetchLuceneIdsRequest(timestamp));

    await fetchLuceneData(datasearchType, params, {
      downloadApiUrl,
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
