import { Investigation, Filter, Order, Dataset, Datafile } from '../app.types';

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

export const FetchDatafilesRequestType =
  'datagateway_table:fetch_datafiles_request';
export const FetchDatafilesFailureType =
  'datagateway_table:fetch_datafiles_failure';
export const FetchDatafilesSuccessType =
  'datagateway_table:fetch_datafiles_success';

export interface SortTablePayload {
  column: string;
  order: Order;
}

export interface FilterTablePayload {
  column: string;
  filter: Filter;
}

export interface FetchInvestigationsFailurePayload {
  error: string;
}

export interface FetchInvestigationsSuccessPayload {
  investigations: Investigation[];
}

export interface FetchDatasetsFailurePayload {
  error: string;
}

export interface FetchDatasetsSuccessPayload {
  datasets: Dataset[];
}

export interface FetchDatasetCountFailurePayload {
  error: string;
}

export interface FetchDatasetCountSuccessPayload {
  investigationId: number;
  count: number;
}

export interface FetchDatafilesFailurePayload {
  error: string;
}

export interface FetchDatafilesSuccessPayload {
  datafiles: Datafile[];
}
