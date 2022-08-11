import {
  ToggleDatafilePreviewerDetailsPanePayload,
  ToggleDatafilePreviewerDetailsPaneType,
} from './actions';
import { DGDataViewState } from '../../../state/app.types';
import { Datafile } from 'datagateway-common';

/**
 * Defines the shape of the redux state for {@link DatafilePreviewer}
 */
interface DatafilePreviewerState {
  datafile?: Datafile;
  datafileContent?: Blob;
  downloadProgress: number;
  isDetailsPaneShown: boolean;
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

const datafilePreviewerInitialState: DatafilePreviewerState = {
  isDetailsPaneShown: true,
  downloadProgress: 0,
};

const datafilePreviewerReducer = {
  [ToggleDatafilePreviewerDetailsPaneType]: toggleDatafilePreviewerDetailsPane,
};

export {
  datafilePreviewerInitialState,
  datafilePreviewerReducer,
  toggleDatafilePreviewerDetailsPane,
};
export type { DatafilePreviewerState };
