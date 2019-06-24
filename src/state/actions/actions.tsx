import { ActionType } from '../app.types';
import { SortTablePayload, SortTableType } from './actions.types';

export const sortTable = (
  column: string,
  order: 'ASC' | 'DESC'
): ActionType<SortTablePayload> => ({
  type: SortTableType,
  payload: {
    column,
    order,
  },
});
