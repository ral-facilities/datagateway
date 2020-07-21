import DGSearchReducer, { initialState } from './dgsearch.reducer';
import { DGSearchState } from '../app.types';
import {
  submitSearchText,
  toggleDataset,
  toggleDatafile,
  toggleInvestigation,
  setDatasetTab,
  setDatafileTab,
  setInvestigationTab,
  selectStartDate,
  selectEndDate,
  toggleLuceneRequestReceived,
  storeDatasetLucene,
  storeDatafileLucene,
  storeInvestigationLucene,
} from '../actions/actions';
import { settingsLoaded } from '../actions';

describe('dgsearch reducer', () => {
  let state: DGSearchState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.settingsLoaded).toBe(false);

    const updatedState = DGSearchReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
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

  it('should set tabs property when set dataset tab action is sent', () => {
    expect(state.tabs.datasetTab).toEqual(false);

    const updatedState = DGSearchReducer(state, setDatasetTab(true));

    expect(updatedState.tabs.datasetTab).toEqual(true);
  });

  it('should set tabs property when set datafile tab action is sent', () => {
    expect(state.tabs.datafileTab).toEqual(false);

    const updatedState = DGSearchReducer(state, setDatafileTab(true));

    expect(updatedState.tabs.datafileTab).toEqual(true);
  });

  it('should set tabs property when set investigation tab action is sent', () => {
    expect(state.tabs.investigationTab).toEqual(false);

    const updatedState = DGSearchReducer(state, setInvestigationTab(true));

    expect(updatedState.tabs.investigationTab).toEqual(true);
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

  it('should set request received property when toggle request received action is sent', () => {
    expect(state.requestReceived).toEqual(false);

    const updatedState = DGSearchReducer(
      state,
      toggleLuceneRequestReceived(true)
    );

    expect(updatedState.requestReceived).toEqual(true);
  });

  it('should store dataset results when store dataset results action is sent', () => {
    expect(state.searchData.dataset).toEqual([]);

    const updatedState = DGSearchReducer(state, storeDatasetLucene([0]));

    expect(updatedState.searchData.dataset).toEqual([0]);
  });

  it('should store datafile results when store datafile results action is sent', () => {
    expect(state.searchData.datafile).toEqual([]);

    const updatedState = DGSearchReducer(state, storeDatafileLucene([0]));

    expect(updatedState.searchData.datafile).toEqual([0]);
  });

  it('should store investigation results when store investigation results action is sent', () => {
    expect(state.searchData.investigation).toEqual([]);

    const updatedState = DGSearchReducer(state, storeInvestigationLucene([0]));

    expect(updatedState.searchData.investigation).toEqual([0]);
  });
});
