import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  TogglePayload,
  SelectDatePayload,
} from './actions.types';
import { ActionType } from '../app.types';
import SelectDates from '../../search/datePicker';

export const toggleDataset = (
  toggleoption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleDatasetType,
  payload: {
    toggleoption,
  },
});

export const toggleDatafile = (
  toggleoption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleDatafileType,
  payload: {
    toggleoption,
  },
});

export const toggleInvestigation = (
  toggleoption: boolean
): ActionType<TogglePayload> => ({
  type: ToggleInvestigationType,
  payload: {
    toggleoption,
  },
});

export const selectStartDate = (
  date: number
): ActionType<SelectDatePayload> => ({
  type: SelectStartDateType,
  payload: {
    date,
  },
});

export const selectEndDate = (date: number): ActionType<SelectDatePayload> => ({
  type: SelectEndDateType,
  payload: {
    date,
  },
});
