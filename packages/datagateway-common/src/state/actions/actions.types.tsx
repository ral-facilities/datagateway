import { Filter, Order, Entity, DownloadCart } from '../../app.types';

// remove uneeded actions

// internal actions
export const SortTableType = 'datagateway_table:sort_table';
export const FilterTableType = 'datagateway_table:filter_table';
export const ClearTableType = 'datagateway_table:clear_table';
export const ConfigureStringsType = 'datagateway_table:configure_strings';
export const ConfigureFacilityNameType =
  'datagateway_table:configure_facility_name';
export const ConfigureFeatureSwitchesType =
  'datagateway_table:configure_feature_switches';
export const ConfigureURLsType = 'datagateway_table:configure_urls';
export const ConfigureBreadcrumbSettingsType =
  'datagateway_table:configure_breadcrumb';
export const SettingsLoadedType = 'datagateway_table:settings_loaded';

export const FetchInvestigationsRequestType =
  'datagateway_table:fetch_investigations_request';
export const FetchInvestigationsFailureType =
  'datagateway_table:fetch_investigations_failure';
export const FetchInvestigationsSuccessType =
  'datagateway_table:fetch_investigations_success';

export const FetchInvestigationDetailsRequestType =
  'datagateway_table:fetch_investigation_details_request';
export const FetchInvestigationDetailsFailureType =
  'datagateway_table:fetch_investigation_details_failure';
export const FetchInvestigationDetailsSuccessType =
  'datagateway_table:fetch_investigation_details_success';

export const FetchInvestigationCountRequestType =
  'datagateway_table:fetch_investigation_count_request';
export const FetchInvestigationCountFailureType =
  'datagateway_table:fetch_investigation_count_failure';
export const FetchInvestigationCountSuccessType =
  'datagateway_table:fetch_investigation_count_success';

export const FetchInvestigationSizeRequestType =
  'datagateway_table:fetch_investigation_size_request';
export const FetchInvestigationSizeFailureType =
  'datagateway_table:fetch_investigation_size_failure';
export const FetchInvestigationSizeSuccessType =
  'datagateway_table:fetch_investigation_size_success';

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

export const FetchDatasetDetailsRequestType =
  'datagateway_table:fetch_dataset_details_request';
export const FetchDatasetDetailsFailureType =
  'datagateway_table:fetch_dataset_details_failure';
export const FetchDatasetDetailsSuccessType =
  'datagateway_table:fetch_dataset_details_success';

export const FetchDatasetCountRequestType =
  'datagateway_table:fetch_dataset_count_request';
export const FetchDatasetCountFailureType =
  'datagateway_table:fetch_dataset_count_failure';
export const FetchDatasetCountSuccessType =
  'datagateway_table:fetch_dataset_count_success';

export const FetchDatasetSizeRequestType =
  'datagateway_table:fetch_dataset_size_request';
export const FetchDatasetSizeFailureType =
  'datagateway_table:fetch_dataset_size_failure';
export const FetchDatasetSizeSuccessType =
  'datagateway_table:fetch_dataset_size_success';

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

export const FetchDatafileDetailsRequestType =
  'datagateway_table:fetch_datafile_details_request';
export const FetchDatafileDetailsFailureType =
  'datagateway_table:fetch_datafile_details_failure';
export const FetchDatafileDetailsSuccessType =
  'datagateway_table:fetch_datafile_details_success';

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

export const FetchInstrumentDetailsRequestType =
  'datagateway_table:fetch_instrument_details_request';
export const FetchInstrumentDetailsFailureType =
  'datagateway_table:fetch_instrument_details_failure';
export const FetchInstrumentDetailsSuccessType =
  'datagateway_table:fetch_instrument_details_success';

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

export const FetchDownloadCartRequestType =
  'datagateway_table:fetch_download_cart_request';
export const FetchDownloadCartFailureType =
  'datagateway_table:fetch_download_cart_failure';
export const FetchDownloadCartSuccessType =
  'datagateway_table:fetch_download_cart_success';

export const AddToCartRequestType = 'datagateway_table:add_to_cart_request';
export const AddToCartFailureType = 'datagateway_table:add_to_cart_failure';
export const AddToCartSuccessType = 'datagateway_table:add_to_cart_success';

export const RemoveFromCartRequestType =
  'datagateway_table:remove_from_cart_request';
export const RemoveFromCartFailureType =
  'datagateway_table:remove_from_cart_failure';
export const RemoveFromCartSuccessType =
  'datagateway_table:remove_from_cart_success';

export const FetchAllIdsRequestType = 'datagateway_table:fetch_all_ids_request';
export const FetchAllIdsFailureType = 'datagateway_table:fetch_all_ids_failure';
export const FetchAllIdsSuccessType = 'datagateway_table:fetch_all_ids_success';

export interface SortTablePayload {
  column: string;
  order: Order | null;
}

export interface FilterTablePayload {
  column: string;
  filter: Filter | null;
}

export interface ConfigureStringsPayload {
  res: ApplicationStrings;
}

export interface ConfigureFacilityNamePayload {
  facilityName: string;
}

export interface FeatureSwitchesPayload {
  switches: FeatureSwitches;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeatureSwitches {}

export interface ConfigureUrlsPayload {
  urls: URLs;
}

export interface URLs {
  idsUrl: string;
  apiUrl: string;
  downloadApiUrl: string;
}

export interface ConfigureBreadcrumbSettingsPayload {
  settings: BreadcrumbSettings;
}

export interface BreadcrumbSettings {
  [matchEntity: string]: {
    replaceEntityField: string;
    replaceEntity?: string;
    parentEntity?: string;
  };
}

export interface RequestPayload {
  timestamp: number;
}

export interface FailurePayload {
  error: string;
}

export interface FetchDataSuccessPayload {
  data: Entity[];
  timestamp: number;
}

export interface FetchDetailsSuccessPayload {
  data: Entity[];
}

export interface FetchAllIdsSuccessPayload {
  data: number[];
  timestamp: number;
}

export interface FetchCountSuccessPayload {
  count: number;
  timestamp: number;
}

export interface FetchDataCountSuccessPayload {
  id: number;
  count: number;
  timestamp: number;
}

export interface FetchSizeSuccessPayload {
  id: number;
  size: number;
}

export interface DownloadCartPayload {
  downloadCart: DownloadCart;
}
