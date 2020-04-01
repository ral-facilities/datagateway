import DGDataViewReducer, { initialState } from './dgdataview.reducer';
import { StateType } from '../app.types';
import {
  loadFeatureSwitches,
  configureStrings,
  loadBreadcrumbSettings,
  settingsLoaded,
} from '../actions';

describe('dgdataview reducer', () => {
  let state: StateType;

  beforeEach(() => {
    // state = { ...dgdataviewInitialState };
    state = JSON.parse(
      JSON.stringify({
        dgdataview: initialState,
      })
    );
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGDataViewReducer(state, {
      type: 'irrelevant action',
    });

    expect(updatedState).toBe(state);
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.dgdataview.settingsLoaded).toBe(false);

    const updatedState = DGDataViewReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
  });

  it('should set res property when configure strings action is sent', () => {
    expect(state).not.toHaveProperty('res');

    const updatedState = DGDataViewReducer(
      state,
      configureStrings({ testSection: { testId: 'test' } })
    );

    expect(updatedState).toHaveProperty('res');
    expect(updatedState.res).toEqual({ testSection: { testId: 'test' } });
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.dgdataview.features).toEqual({});

    const updatedState = DGDataViewReducer(state, loadFeatureSwitches({}));

    expect(updatedState.features).toEqual({});
  });

  it('should set breadcrumb settings property when configure breadcrumb settings action is sent', () => {
    expect(state.dgdataview.breadcrumbSettings).toEqual({});

    const updatedState = DGDataViewReducer(
      state,
      loadBreadcrumbSettings({
        test: {
          replaceEntityField: 'TITLE',
        },
      })
    );

    expect(updatedState.breadcrumbSettings).toEqual({
      test: {
        replaceEntityField: 'TITLE',
      },
    });
  });
});
