import {
  DownloadCart,
  Entity,
  Filter,
  FiltersType,
  Order,
  QueryParams,
  SortType,
  ViewsType,
  MicroFrontendId,
  Datafile,
  Dataset,
  Instrument,
  Investigation,
} from '../../app.types';
import { DlsDatasetDetailsPanelTab } from '../../detailsPanels/dls/datasetDetailsPanel.component';
import { DlsVisitDetailsPanelTab } from '../../detailsPanels/dls/visitDetailsPanel.component';
import type { IsisDatafileDetailsPanelTab } from '../../detailsPanels/isis/datafileDetailsPanel.component';
import type { IsisDatasetDetailsPanelTab } from '../../detailsPanels/isis/datasetDetailsPanel.component';
import type { IsisInstrumentDetailsPanelTab } from '../../detailsPanels/isis/instrumentDetailsPanel.component';
import type { IsisInvestigationDetailsPanelTab } from '../../detailsPanels/isis/investigationDetailsPanel.component';

// parent app actions
export const CustomFrontendMessageType = `${MicroFrontendId}:api`;
export const NotificationType = `${CustomFrontendMessageType}:notification`;
export const InvalidateTokenType = `${CustomFrontendMessageType}:invalidate_token`;
export const RegisterRouteType = `${CustomFrontendMessageType}:register_route`;
export const RequestPluginRerenderType = `${CustomFrontendMessageType}:plugin_rerender`;
export const SendThemeOptionsType = `${CustomFrontendMessageType}:send_themeoptions`;
export const BroadcastSignOutType = `${CustomFrontendMessageType}:signout`;

// internal actions
export const ConfigureFacilityNameType =
  'datagateway_common:configure_facility_name';
export const ConfigureURLsType = 'datagateway_common:configure_urls';

export const SortTableType = 'datagateway_common:sort_table';
export const FilterTableType = 'datagateway_common:filter_table';
export const SortUpdateType = 'datagateway_common:sort_update';
export const FilterUpdateType = 'datagateway_common:filter_update';
export const PageUpdateType = 'datagateway_common:page_update';
export const ResultsUpdateType = 'datagateway_common:results_update';

export const UpdateFiltersType = 'datagateway_common:update_filters';
export const UpdateSortType = 'datagateway_common:update_sort';
export const UpdateQueryType = 'datagateway_common:update_query';

export const UpdateViewType = 'datagateway_common:update_view';
export const UpdateSearchType = 'datagateway_common:update_search';
export const UpdatePageType = 'datagateway_common:update_page';
export const UpdateResultsType = 'datagateway_common:update_results';

export const UpdateSaveViewType = 'datagateway_common:update_save_view';

export const ClearTableType = 'datagateway_common:clear_table';
export const ClearDataType = 'datagateway_common:clear_data';

export const FetchInvestigationsRequestType =
  'datagateway_common:fetch_investigations_request';
export const FetchInvestigationsFailureType =
  'datagateway_common:fetch_investigations_failure';
export const FetchInvestigationsSuccessType =
  'datagateway_common:fetch_investigations_success';

export const FetchInvestigationDetailsRequestType =
  'datagateway_common:fetch_investigation_details_request';
export const FetchInvestigationDetailsFailureType =
  'datagateway_common:fetch_investigation_details_failure';
export const FetchInvestigationDetailsSuccessType =
  'datagateway_common:fetch_investigation_details_success';

export const FetchInvestigationCountRequestType =
  'datagateway_common:fetch_investigation_count_request';
export const FetchInvestigationCountFailureType =
  'datagateway_common:fetch_investigation_count_failure';
export const FetchInvestigationCountSuccessType =
  'datagateway_common:fetch_investigation_count_success';

export const FetchInvestigationSizeRequestType =
  'datagateway_common:fetch_investigation_size_request';
export const FetchInvestigationSizeFailureType =
  'datagateway_common:fetch_investigation_size_failure';
export const FetchInvestigationSizeSuccessType =
  'datagateway_common:fetch_investigation_size_success';

export const FetchInvestigationDatasetsCountRequestType =
  'datagateway_common:fetch_investigation_datasets_count_request';
export const FetchInvestigationDatasetsCountFailureType =
  'datagateway_common:fetch_investigation_datasets_count_failure';
export const FetchInvestigationDatasetsCountSuccessType =
  'datagateway_common:fetch_investigation_datasets_count_success';

export const FetchDatasetsRequestType =
  'datagateway_common:fetch_datasets_request';
export const FetchDatasetsFailureType =
  'datagateway_common:fetch_datasets_failure';
export const FetchDatasetsSuccessType =
  'datagateway_common:fetch_datasets_success';

export const FetchDatasetDetailsRequestType =
  'datagateway_common:fetch_dataset_details_request';
export const FetchDatasetDetailsFailureType =
  'datagateway_common:fetch_dataset_details_failure';
export const FetchDatasetDetailsSuccessType =
  'datagateway_common:fetch_dataset_details_success';

export const FetchDatasetCountRequestType =
  'datagateway_common:fetch_dataset_count_request';
export const FetchDatasetCountFailureType =
  'datagateway_common:fetch_dataset_count_failure';
export const FetchDatasetCountSuccessType =
  'datagateway_common:fetch_dataset_count_success';

export const FetchDatasetSizeRequestType =
  'datagateway_common:fetch_dataset_size_request';
export const FetchDatasetSizeFailureType =
  'datagateway_common:fetch_dataset_size_failure';
export const FetchDatasetSizeSuccessType =
  'datagateway_common:fetch_dataset_size_success';

export const FetchDatasetDatafilesCountRequestType =
  'datagateway_common:fetch_dataset_datafiles_count_request';
export const FetchDatasetDatafilesCountFailureType =
  'datagateway_common:fetch_dataset_datafiles_count_failure';
export const FetchDatasetDatafilesCountSuccessType =
  'datagateway_common:fetch_dataset_datafiles_count_success';

export const DownloadDatasetRequestType =
  'datagateway_common:download_dataset_request';
export const DownloadDatasetFailureType =
  'datagateway_common:download_dataset_failure';
export const DownloadDatasetSuccessType =
  'datagateway_common:download_dataset_success';

export const FetchDatafilesRequestType =
  'datagateway_common:fetch_datafiles_request';
export const FetchDatafilesFailureType =
  'datagateway_common:fetch_datafiles_failure';
export const FetchDatafilesSuccessType =
  'datagateway_common:fetch_datafiles_success';

export const FetchDatafileDetailsRequestType =
  'datagateway_common:fetch_datafile_details_request';
export const FetchDatafileDetailsFailureType =
  'datagateway_common:fetch_datafile_details_failure';
export const FetchDatafileDetailsSuccessType =
  'datagateway_common:fetch_datafile_details_success';

export const FetchDatafileCountRequestType =
  'datagateway_common:fetch_datafile_count_request';
export const FetchDatafileCountFailureType =
  'datagateway_common:fetch_datafile_count_failure';
export const FetchDatafileCountSuccessType =
  'datagateway_common:fetch_datafile_count_success';

export const DownloadDatafileRequestType =
  'datagateway_common:download_datafile_request';
export const DownloadDatafileFailureType =
  'datagateway_common:download_datafile_failure';
export const DownloadDatafileSuccessType =
  'datagateway_common:download_datafile_success';

export const FetchInstrumentsRequestType =
  'datagateway_common:fetch_instruments_request';
export const FetchInstrumentsFailureType =
  'datagateway_common:fetch_instruments_failure';
export const FetchInstrumentsSuccessType =
  'datagateway_common:fetch_instruments_success';

export const FetchInstrumentDetailsRequestType =
  'datagateway_common:fetch_instrument_details_request';
export const FetchInstrumentDetailsFailureType =
  'datagateway_common:fetch_instrument_details_failure';
export const FetchInstrumentDetailsSuccessType =
  'datagateway_common:fetch_instrument_details_success';

export const FetchInstrumentCountRequestType =
  'datagateway_common:fetch_instrument_count_request';
export const FetchInstrumentCountFailureType =
  'datagateway_common:fetch_instrument_count_failure';
export const FetchInstrumentCountSuccessType =
  'datagateway_common:fetch_instrument_count_success';

export const FetchFacilityCyclesRequestType =
  'datagateway_common:fetch_facility_cycles_request';
export const FetchFacilityCyclesFailureType =
  'datagateway_common:fetch_facility_cycles_failure';
export const FetchFacilityCyclesSuccessType =
  'datagateway_common:fetch_facility_cycles_success';

export const FetchFacilityCycleCountRequestType =
  'datagateway_common:fetch_facility_cycle_count_request';
export const FetchFacilityCycleCountFailureType =
  'datagateway_common:fetch_facility_cycle_count_failure';
export const FetchFacilityCycleCountSuccessType =
  'datagateway_common:fetch_facility_cycle_count_success';

export const FetchStudiesRequestType =
  'datagateway_common:fetch_studies_request';
export const FetchStudiesFailureType =
  'datagateway_common:fetch_studies_failure';
export const FetchStudiesSuccessType =
  'datagateway_common:fetch_studies_success';

export const FetchStudyCountRequestType =
  'datagateway_common:fetch_study_count_request';
export const FetchStudyCountFailureType =
  'datagateway_common:fetch_study_count_failure';
export const FetchStudyCountSuccessType =
  'datagateway_common:fetch_study_count_success';

export const FetchDownloadCartRequestType =
  'datagateway_common:fetch_download_cart_request';
export const FetchDownloadCartFailureType =
  'datagateway_common:fetch_download_cart_failure';
export const FetchDownloadCartSuccessType =
  'datagateway_common:fetch_download_cart_success';

export const AddToCartRequestType = 'datagateway_common:add_to_cart_request';
export const AddToCartFailureType = 'datagateway_common:add_to_cart_failure';
export const AddToCartSuccessType = 'datagateway_common:add_to_cart_success';

export const RemoveFromCartRequestType =
  'datagateway_common:remove_from_cart_request';
export const RemoveFromCartFailureType =
  'datagateway_common:remove_from_cart_failure';
export const RemoveFromCartSuccessType =
  'datagateway_common:remove_from_cart_success';

export const FetchAllIdsRequestType =
  'datagateway_common:fetch_all_ids_request';
export const FetchAllIdsFailureType =
  'datagateway_common:fetch_all_ids_failure';
export const FetchAllIdsSuccessType =
  'datagateway_common:fetch_all_ids_success';

export const FetchFilterRequestType = 'datagateway_common:fetch_filter_request';
export const FetchFilterFailureType = 'datagateway_common:fetch_filter_failure';
export const FetchFilterSuccessType = 'datagateway_common:fetch_filter_success';

export const IsisDatafileDetailsPanelChangeTabType =
  'datagateway_common:isis_datafile_details_panel_change_tab';
export const IsisDatasetDetailsPanelChangeTabType =
  'datagateway_common:isis_dataset_details_panel_change_tab';
export const IsisInstrumentDetailsPanelChangeTabType =
  'datagateway_common:isis_instrument_details_panel_change_tab';
export const IsisInvestigationDetailsPanelChangeTabType =
  'datagateway_common:isis_investigation_details_panel_change_tab';
export const DlsDatasetDetailsPanelChangeTabType =
  'datagateway_common:dls_dataset_details_panel_change_tab';
export const DlsVisitDetailsPanelChangeTabType =
  'datagateway_common:dls_visit_details_panel_change_tab';

export interface SortTablePayload {
  column: string;
  order: Order | null;
}

export interface FilterTablePayload {
  column: string;
  filter: Filter | null;
}

export interface ConfigureFacilityNamePayload {
  facilityName: string;
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
  icatUrl: string;
}

export interface PluginRoute {
  section: string;
  link: string;
  displayName: string;
  admin?: boolean;
  hideFromMenu?: boolean;
  order: number;
}

export interface UpdateViewPayload {
  view: ViewsType;
}

export interface UpdateSearchPayload {
  search: string | null;
}

export interface UpdatePagePayload {
  page: number | null;
}

export interface UpdateResultsPayload {
  results: number | null;
}

export interface UpdateFiltersPayload {
  filters: FiltersType;
}

export interface UpdateSortPayload {
  sort: SortType;
}

export interface UpdateQueryPayload {
  query: QueryParams;
}

export interface SaveViewPayload {
  view: ViewsType;
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

export interface FetchIdsSuccessPayload {
  data: number[];
  timestamp: number;
}

export interface FetchFilterSuccessPayload {
  filterKey: string;
  data: string[];
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

/**
 * Payload for the ISIS datafile details panel change tab action.
 */
export interface IsisDatafileDetailsPanelChangeTabPayload {
  datafileId: Datafile['id'];
  newTab: IsisDatafileDetailsPanelTab;
}

/**
 * Payload for the ISIS dataset details panel change tab action.
 */
export interface IsisDatasetDetailsPanelChangeTabPayload {
  datasetId: Dataset['id'];
  newTab: IsisDatasetDetailsPanelTab;
}

/**
 * Payload for the ISIS instrument details panel change tab action.
 */
export interface IsisInstrumentDetailsPanelChangeTabPayload {
  instrumentId: Instrument['id'];
  newTab: IsisInstrumentDetailsPanelTab;
}

/**
 * Payload for the ISIS investigation details panel change tab action.
 */
export interface IsisInvestigationDetailsPanelChangeTabPayload {
  investigationId: Investigation['id'];
  newTab: IsisInvestigationDetailsPanelTab;
}

/**
 * Payload for the DLS dataset details panel change tab action.
 */
export interface DlsDatasetDetailsPanelChangeTabPayload {
  datasetId: Dataset['id'];
  newTab: DlsDatasetDetailsPanelTab;
}

export interface DlsVisitDetailsPanelChangeTabPayload {
  investigationId: Investigation['id'];
  newTab: DlsVisitDetailsPanelTab;
}
