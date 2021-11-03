import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '..';
import handleICATError from '../handleICATError';
import { readSciGatewayToken } from '../parseTokens';

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

  if (params.startDate !== null) {
    const stringStartDate = format(params.startDate, 'yyyy-MM-dd');
    const stringStartDateArray = stringStartDate.split('-');
    query.lower =
      stringStartDateArray[0] +
      stringStartDateArray[1] +
      stringStartDateArray[2] +
      '0000';
  }

  if (params.endDate !== null) {
    const stringEndDate = format(params.endDate, 'yyyy-MM-dd');
    const stringEndDateArray = stringEndDate.split('-');
    query.upper =
      stringEndDateArray[0] +
      stringEndDateArray[1] +
      stringEndDateArray[2] +
      '2359';
  }

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

  return axios
    .get(`${settings.icatUrl}/lucene/data`, {
      params: queryParams,
    })
    .then((response) => {
      // flatten result into array
      return response.data.map((result: { id: number }) => result.id);
    });
};

export const useLuceneSearch = (
  datasearchType: DatasearchType,
  params: LuceneSearchParams
): UseQueryResult<number[], AxiosError> => {
  const icatUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.icatUrl
  );

  return useQuery<
    number[],
    AxiosError,
    number[],
    [string, DatasearchType, LuceneSearchParams]
  >(
    ['search', datasearchType, params],
    () => {
      return fetchLuceneData(datasearchType, params, { icatUrl });
    },
    {
      onError: (error) => {
        handleICATError(error);
      },
      // we want to trigger search manually via refetch
      // so disable the query to disable automatic fetching
      enabled: false,
    }
  );
};
