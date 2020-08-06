import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { format } from 'date-fns';
import { readSciGatewayToken } from '../..';
import { ThunkResult } from '../app.types';
import axios from 'axios';

interface QueryParameters {
  target: string;
  text?: string;
  lower?: string;
  upper?: string;
}

interface RequestParameters {
  sessionId: string | null;
  maxCount: number;
}

type LuceneParameters = QueryParameters | RequestParameters;

type DatasearchType = 'Investigation' | 'Dataset' | 'Datafile';

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

export const fetchLuceneData = (
  datasearchType: DatasearchType,
  params: UrlBuilderParameters & {
    maxCount?: number;
  }
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const { downloadApiUrl } = getState().dgcommon.urls;

    // Create ICAT url.
    const splitUrl = downloadApiUrl.split('/');
    const icatUrl = `${splitUrl.slice(0, splitUrl.length - 1).join('/')}/icat`;

    // Query params.
    const queryParams = {
      sessionId: readSciGatewayToken().sessionId,
      query: urlParamsBuilder(datasearchType, params),
      maxCount: params.maxCount ? params.maxCount : 300,
    };

    await axios.get(`${icatUrl}/lucene/data`, {
      params: queryParams,
    });
  };
};
