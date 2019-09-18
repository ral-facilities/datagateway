import { Filter, Order, Entity } from 'datagateway-common';

// parent app actions
export const RegisterRouteType = 'daaas:api:register_route';
export const RequestPluginRerenderType = 'daaas:api:plugin_rerender';

// internal actions
export const SortTableType = 'datagateway_table:sort_table';
export const FilterTableType = 'datagateway_table:filter_table';

export const FetchInvestigationsRequestType =
  'datagateway_table:fetch_investigations_request';
export const FetchInvestigationsFailureType =
  'datagateway_table:fetch_investigations_failure';
export const FetchInvestigationsSuccessType =
  'datagateway_table:fetch_investigations_success';

export const FetchInvestigationCountRequestType =
  'datagateway_table:fetch_investigation_count_request';
export const FetchInvestigationCountFailureType =
  'datagateway_table:fetch_investigation_count_failure';
export const FetchInvestigationCountSuccessType =
  'datagateway_table:fetch_investigation_count_success';

export const FetchInvestigationDatasetsCountRequestType =
  'datagateway_table:fetch_investigation_datasets_count_request';
export const FetchInvestigationDatasetsCountFailureType =
  'datagateway_table:fetch_investigation_datasets_count_failure';
export const FetchInvestigationDatasetsCountSuccessType =
  'datagateway_table:fetch_investigation_datasets_count_success';

export const FetchDatasetsRequestType =
  'datagateway_table:fetch_datasets_request';
export const FetchDatasetsFailureType =
  'datagateway_table:fetch_datasets_failure';
export const FetchDatasetsSuccessType =
  'datagateway_table:fetch_datasets_success';

export const FetchDatasetCountRequestType =
  'datagateway_table:fetch_dataset_count_request';
export const FetchDatasetCountFailureType =
  'datagateway_table:fetch_dataset_count_failure';
export const FetchDatasetCountSuccessType =
  'datagateway_table:fetch_dataset_count_success';

export const FetchDatasetDatafilesCountRequestType =
  'datagateway_table:fetch_dataset_datafiles_count_request';
export const FetchDatasetDatafilesCountFailureType =
  'datagateway_table:fetch_dataset_datafiles_count_failure';
export const FetchDatasetDatafilesCountSuccessType =
  'datagateway_table:fetch_dataset_datafiles_count_success';

export const DownloadDatasetRequestType =
  'datagateway_table:download_dataset_request';
export const DownloadDatasetFailureType =
  'datagateway_table:download_dataset_failure';
export const DownloadDatasetSuccessType =
  'datagateway_table:download_dataset_success';

export const FetchDatafilesRequestType =
  'datagateway_table:fetch_datafiles_request';
export const FetchDatafilesFailureType =
  'datagateway_table:fetch_datafiles_failure';
export const FetchDatafilesSuccessType =
  'datagateway_table:fetch_datafiles_success';

export const FetchDatafileCountRequestType =
  'datagateway_table:fetch_datafile_count_request';
export const FetchDatafileCountFailureType =
  'datagateway_table:fetch_datafile_count_failure';
export const FetchDatafileCountSuccessType =
  'datagateway_table:fetch_datafile_count_success';

export const DownloadDatafileRequestType =
  'datagateway_table:download_datafile_request';
export const DownloadDatafileFailureType =
  'datagateway_table:download_datafile_failure';
export const DownloadDatafileSuccessType =
  'datagateway_table:download_datafile_success';

export const FetchInstrumentsRequestType =
  'datagateway_table:fetch_instruments_request';
export const FetchInstrumentsFailureType =
  'datagateway_table:fetch_instruments_failure';
export const FetchInstrumentsSuccessType =
  'datagateway_table:fetch_instruments_success';

export const FetchInstrumentCountRequestType =
  'datagateway_table:fetch_instrument_count_request';
export const FetchInstrumentCountFailureType =
  'datagateway_table:fetch_instrument_count_failure';
export const FetchInstrumentCountSuccessType =
  'datagateway_table:fetch_instrument_count_success';

export const FetchFacilityCyclesRequestType =
  'datagateway_table:fetch_facility_cycles_request';
export const FetchFacilityCyclesFailureType =
  'datagateway_table:fetch_facility_cycles_failure';
export const FetchFacilityCyclesSuccessType =
  'datagateway_table:fetch_facility_cycles_success';

export const FetchFacilityCycleCountRequestType =
  'datagateway_table:fetch_facility_cycle_count_request';
export const FetchFacilityCycleCountFailureType =
  'datagateway_table:fetch_facility_cycle_count_failure';
export const FetchFacilityCycleCountSuccessType =
  'datagateway_table:fetch_facility_cycle_count_success';

export interface SortTablePayload {
  column: string;
  order: Order | null;
}

export interface FilterTablePayload {
  column: string;
  filter: Filter | null;
}

export interface FailurePayload {
  error: string;
}

export interface FetchDataSuccessPayload {
  data: Entity[];
}

export interface FetchCountSuccessPayload {
  count: number;
}

export interface FetchDataCountSuccessPayload {
  id: number;
  count: number;
}
