import {
  sortTable,
  fetchInvestigations,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
} from './actions';
import {
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessType,
} from './actions.types';
import axios from 'axios';
import { Action } from 'history';
import { StateType, Investigation } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';

jest.mock('axios');

describe('Actions', () => {
  it('given an column and order sortTable returns a SortTableType with SortTablePayload', () => {
    const action = sortTable('test', 'DESC');
    expect(action.type).toEqual(SortTableType);
    expect(action.payload).toEqual({ column: 'test', order: 'DESC' });
  });

  it('dispatches fetchInvestigationsRequest and fetchInvestigationsSuccess actions upon successful fetchInvestigations action', async () => {
    const mockData: Investigation[] = [
      {
        ID: '1',
        TITLE: 'Test 1',
        VISIT_ID: 1,
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        INSTRUMENT: {
          NAME: 'LARMOR',
        },
        STARTDATE: new Date('2019-06-10'),
        ENDDATE: new Date('2019-06-11'),
      },
      {
        ID: '2',
        TITLE: 'Test 2',
        VISIT_ID: 2,
        RB_NUMBER: '2',
        DOI: 'doi 2',
        SIZE: 10000,
        INSTRUMENT: {
          NAME: 'LARMOR',
        },
        STARTDATE: new Date('2019-06-10'),
        ENDDATE: new Date('2019-06-12'),
      },
    ];

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchInvestigations();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(fetchInvestigationsSuccess(mockData));
  });

  it('dispatches fetchInvestigationsRequest and fetchInvestigationsFailure actions upon unsuccessful fetchInvestigations action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchInvestigations();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchInvestigationsRequest());
    expect(actions[1]).toEqual(
      fetchInvestigationsFailure('Test error message')
    );
  });
});
