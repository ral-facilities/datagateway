import type { RouterState } from 'connected-react-router';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
import type {
  Datafile,
  Dataset,
  Instrument,
  Investigation,
} from '../app.types';
import { DlsDatasetDetailsPanelTab } from '../detailsPanels/dls/datasetDetailsPanel.component';
import { DlsVisitDetailsPanelTab } from '../detailsPanels/dls/visitDetailsPanel.component';
import type { IsisDatafileDetailsPanelTab } from '../detailsPanels/isis/datafileDetailsPanel.component';
import type { IsisDatasetDetailsPanelTab } from '../detailsPanels/isis/datasetDetailsPanel.component';
import type { IsisInstrumentDetailsPanelTab } from '../detailsPanels/isis/instrumentDetailsPanel.component';
import type { IsisInvestigationDetailsPanelTab } from '../detailsPanels/isis/investigationDetailsPanel.component';
import type { URLs } from './actions/actions.types';

export interface DGCommonState {
  facilityName: string;
  urls: URLs;
  isisDatafileDetailsPanel: Record<
    Datafile['id'],
    {
      selectedTab: IsisDatafileDetailsPanelTab;
    }
  >;
  isisDatasetDetailsPanel: Record<
    Dataset['id'],
    {
      selectedTab: IsisDatasetDetailsPanelTab;
    }
  >;
  isisInstrumentDetailsPanel: Record<
    Instrument['id'],
    {
      selectedTab: IsisInstrumentDetailsPanelTab;
    }
  >;
  isisInvestigationDetailsPanel: Record<
    Investigation['id'],
    {
      selectedTab: IsisInvestigationDetailsPanelTab;
    }
  >;
  dlsDatasetDetailsPanel: Record<
    Dataset['id'],
    {
      selectedTab: DlsDatasetDetailsPanelTab;
    }
  >;
  dlsVisitDetailsPanel: Record<
    Investigation['id'],
    {
      selectedTab: DlsVisitDetailsPanelTab;
    }
  >;
}

export interface StateType {
  dgcommon: DGCommonState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
