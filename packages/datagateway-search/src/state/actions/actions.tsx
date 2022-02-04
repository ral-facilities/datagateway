import { ActionType } from '../app.types';
import {
  SetDatafileTabType,
  SetDatasetTabType,
  SetInvestigationTabType,
  TogglePayload,
} from './actions.types';

export const setDatasetTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetDatasetTabType,
  payload: {
    toggleOption,
  },
});

export const setDatafileTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetDatafileTabType,
  payload: {
    toggleOption,
  },
});

export const setInvestigationTab = (
  toggleOption: boolean
): ActionType<TogglePayload> => ({
  type: SetInvestigationTabType,
  payload: {
    toggleOption,
  },
});
