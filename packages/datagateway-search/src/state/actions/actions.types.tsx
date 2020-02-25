import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export const SearchTextType = 'datagateway_search:input_text';
export const ToggleDatasetType = 'datagateway_search:toggle_dataset';
export const ToggleDatafileType = 'datagateway_search:toggle_datafile';
export const ToggleInvestigationType =
  'datagateway_search:toggle_investigation';
export const SelectStartDateType = 'datagateway_search:select_startdate';
export const SelectEndDateType = 'datagateway_search:select_enddate';
export const ToggleLuceneRequestReceivedType =
  'datagateway_search:lucene_request_received';
export const StoreLuceneDatasetType =
  'datagateway_search:store_lucene_results_dataset';
export const StoreLuceneDatafileType =
  'datagateway_search:store_lucene_results_datafile';
export const StoreLuceneInvestigationType =
  'datagateway_search:store_lucene_results_investigation';

export interface TogglePayload {
  toggleOption: boolean;
}

export interface SelectDatePayload {
  date: MaterialUiPickersDate;
}

export interface SearchTextPayload {
  searchText: string;
}

export interface CheckRequestReceivedPayload {
  requestReceived: boolean;
}

export interface LuceneResultTypePayload {
  searchData: any;
}
