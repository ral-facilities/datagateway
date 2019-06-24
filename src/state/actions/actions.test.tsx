import { sortTable } from './actions';
import { SortTableType } from './actions.types';

describe('Actions', () => {
  it('given an column and order sortTable returns a SortTableType with SortTablePayload', () => {
    const action = sortTable('test', 'DESC');
    expect(action.type).toEqual(SortTableType);
    expect(action.payload).toEqual({ column: 'test', order: 'DESC' });
  });
});
