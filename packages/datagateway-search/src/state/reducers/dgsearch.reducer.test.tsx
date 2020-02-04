import DGSearchReducer, { initialState } from './dgsearch.reducer';
import { DGSearchState } from '../app.types';
import {
  submitSearchText,
  toggleDataset,
  toggleDatafile,
  toggleInvestigation,
  selectStartDate,
  selectEndDate,
} from '../actions/actions';

describe('dgsearch reducer', () => {
  let state: DGSearchState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGSearchReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set search text property when handle submit text action is sent', () => {
    expect(state.searchText).toEqual('');

    const updatedState = DGSearchReducer(state, submitSearchText('this'));

    expect(updatedState.searchText).toEqual('this');
  });

  it('should set checkbox property when toggle dataset action is sent', () => {
    expect(state.checkBox.dataset).toEqual(true);

    const updatedState = DGSearchReducer(state, toggleDataset(false));

    expect(updatedState.checkBox.dataset).toEqual(false);
  });

  it('should set checkbox property when toggle datafile action is sent', () => {
    expect(state.checkBox.datafile).toEqual(true);

    const updatedState = DGSearchReducer(state, toggleDatafile(false));

    expect(updatedState.checkBox.datafile).toEqual(false);
  });

  it('should set checkbox property when toggle investigation action is sent', () => {
    expect(state.checkBox.investigation).toEqual(true);

    const updatedState = DGSearchReducer(state, toggleInvestigation(false));

    expect(updatedState.checkBox.investigation).toEqual(false);
  });

  it('should set start date property when select start date action is sent', () => {
    expect(state.selectDate.startDate).toEqual(null);

    const updatedState = DGSearchReducer(
      state,
      selectStartDate(new Date('2012-01-01'))
    );

    expect(updatedState.selectDate.startDate).toEqual(new Date('2012-01-01'));
  });

  it('should set end date property when select end date action is sent', () => {
    expect(state.selectDate.endDate).toEqual(null);

    const updatedState = DGSearchReducer(
      state,
      selectEndDate(new Date('2013-11-11'))
    );

    expect(updatedState.selectDate.endDate).toEqual(new Date('2013-11-11'));
  });
});
