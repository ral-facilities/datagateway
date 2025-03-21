import {
  MicroFrontendId,
  Datafile,
  Dataset,
  Instrument,
  Investigation,
  DownloadSettingsAccessMethod,
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
export const ConfigureQueryRetriesType = 'datagateway_common:configure_retries';
export const ConfigureAccessMethodsType =
  'datagateway_common:configure_access_methods';

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

export interface ConfigureFacilityNamePayload {
  facilityName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeatureSwitches {}

export interface ConfigureUrlsPayload {
  urls: URLs;
}

export interface ConfigureQueryRetriesPayload {
  queryRetries?: number;
}

export interface ConfigureAccessMethodsPayload {
  accessMethods?: DownloadSettingsAccessMethod;
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
