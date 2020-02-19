import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export const SearchTextType = 'datagateway_search:input_text';
export const ToggleDatasetType = 'datagateway_search:toggle_dataset';
export const ToggleDatafileType = 'datagateway_search:toggle_datafile';
export const ToggleInvestigationType =
  'datagateway_search:toggle_investigation';
export const SelectStartDateType = 'datagateway_search:select_startdate';
export const SelectEndDateType = 'datagateway_search:select_enddate';
export const ToggleRequestSentType = 'datagateway_search:request_sent';
export const StoreLuceneResultsType = 'datagateway_search:store_luceneresults';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface SelectDatePayload {
  date: MaterialUiPickersDate;
}

export interface SearchTextPayload {
  searchText: string;
}

export interface CheckRequestSentPayload {
  requestSent: boolean;
}

// export interface LuceneSearchResultPayload {
//   searchData: SearchResultType;
// }
// interface SearchResult {
//   // object: {
//   //   ID: number;
//   //   searchScore: number;
//   // };
//   ID: number;
// }

// export type SearchResultType = SearchResult | null;
export interface SearchResultPayload {
  searchData: number;
}
