import DGSearchReducer, { initialState } from './dgsearch.reducer';
import { DGSearchState } from '../app.types';
import {
  setDatasetTab,
  setDatafileTab,
  setInvestigationTab,
} from '../actions/actions';
import {
  loadMaxNumResults,
  loadSearchableEntitites,
  loadSelectAllSetting,
  settingsLoaded,
} from '../actions';

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

  it('should set selectAllSetting when configuring action is sent', () => {
    expect(state.selectAllSetting).toEqual(true);

    const updatedState = DGSearchReducer(state, loadSelectAllSetting(false));

    expect(updatedState.selectAllSetting).toEqual(false);
  });

  it('should set searchableEntities property when configuring action is sent', () => {
    expect(state.searchableEntities).toEqual([
      'investigation',
      'dataset',
      'datafile',
    ]);

    const updatedState = DGSearchReducer(
      state,
      loadSearchableEntitites(['dataset'])
    );

    expect(updatedState.searchableEntities).toEqual(['dataset']);
  });

  it('should set maxNumResults property when configuring action is sent', () => {
    expect(state.maxNumResults).toEqual(100);

    const updatedState = DGSearchReducer(state, loadMaxNumResults(200));

    expect(updatedState.maxNumResults).toEqual(200);
  });
});
