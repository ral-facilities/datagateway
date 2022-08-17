import DATAFILE_PREVIEWER_DEFAULT from '../defaults';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
  ResetDatafilePreviewerZoomLevelType,
  ToggleDatafilePreviewerDetailsPanePayload,
  ToggleDatafilePreviewerDetailsPaneType,
} from './actions';
import { DGDataViewState } from '../../../state/app.types';

/**
 * Defines the shape of the redux state for {@link DatafilePreviewer}
 */
interface DatafilePreviewerState {
  /**
   * Whether the details pane should be shown or not.
   */
  isDetailsPaneShown: boolean;

  /**
   * The current zoom level of the previewer, in percentage. For example,
   * 100% maps to 100, 110% maps to 110, 80% maps to 80, etc.
   */
  zoomLevel: number;
}

function toggleDatafilePreviewerDetailsPane(
  state: DGDataViewState,
  payload: ToggleDatafilePreviewerDetailsPanePayload
): DGDataViewState {
  return {
    ...state,
    isisDatafilePreviewer: {
      ...state.isisDatafilePreviewer,
      isDetailsPaneShown: payload.shouldShow,
    },
  };
}

function incDatafilePreviewerZoomLevel(
  state: DGDataViewState
): DGDataViewState {
  return {
    ...state,
    isisDatafilePreviewer: {
      ...state.isisDatafilePreviewer,
      zoomLevel:
        state.isisDatafilePreviewer.zoomLevel +
        DATAFILE_PREVIEWER_DEFAULT.zoomLevelStep,
    },
  };
}

function decDatafilePreviewerZoomLevel(
  state: DGDataViewState
): DGDataViewState {
  return {
    ...state,
    isisDatafilePreviewer: {
      ...state.isisDatafilePreviewer,
      // zoom level should not go lower than zoomLevelStep
      // otherwise will result in zoom level <= 0.
      zoomLevel: Math.max(
        DATAFILE_PREVIEWER_DEFAULT.minZoomLevel,
        state.isisDatafilePreviewer.zoomLevel -
          DATAFILE_PREVIEWER_DEFAULT.zoomLevelStep
      ),
    },
  };
}

function resetDatafilePreviewerZoomLevel(
  state: DGDataViewState
): DGDataViewState {
  return {
    ...state,
    isisDatafilePreviewer: {
      ...state.isisDatafilePreviewer,
      zoomLevel: DATAFILE_PREVIEWER_DEFAULT.zoomLevel,
    },
  };
}

const datafilePreviewerInitialState: DatafilePreviewerState = {
  isDetailsPaneShown: DATAFILE_PREVIEWER_DEFAULT.showDetailsPane,
  zoomLevel: DATAFILE_PREVIEWER_DEFAULT.zoomLevel,
};

const datafilePreviewerReducer = {
  [ToggleDatafilePreviewerDetailsPaneType]: toggleDatafilePreviewerDetailsPane,
  [IncrementDatafilePreviewerZoomLevelType]: incDatafilePreviewerZoomLevel,
  [DecrementDatafilePreviewerZoomLevelType]: decDatafilePreviewerZoomLevel,
  [ResetDatafilePreviewerZoomLevelType]: resetDatafilePreviewerZoomLevel,
};

export {
  datafilePreviewerInitialState,
  datafilePreviewerReducer,
  toggleDatafilePreviewerDetailsPane,
  incDatafilePreviewerZoomLevel,
  decDatafilePreviewerZoomLevel,
  resetDatafilePreviewerZoomLevel,
};
export type { DatafilePreviewerState };
