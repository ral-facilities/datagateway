import { ActionType } from '../app.types';
import {
  SetDatafileTabType,
  SetDatasetTabType,
  SetInvestigationTabType,
  TogglePayload,
  CurrentTabPayload,
  SetCurrentTabType,
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

export const setCurrentTab = (
  currentTab: string
): ActionType<CurrentTabPayload> => ({
  type: SetCurrentTabType,
  payload: {
    currentTab,
  },
});
