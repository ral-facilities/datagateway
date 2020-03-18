import DGTableReducer, { initialState } from './dgtable.reducer';
import { StateType } from '../app.types';
import {
  loadFeatureSwitches,
  configureStrings,
  loadBreadcrumbSettings,
  settingsLoaded,
} from '../actions';

describe('dgtable reducer', () => {
  let state: StateType;

  beforeEach(() => {
    // state = { ...dgTableInitialState };
    state = JSON.parse(
      JSON.stringify({
        dgtable: initialState,
      })
    );
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGTableReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.dgtable.settingsLoaded).toBe(false);

    const updatedState = DGTableReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
  });

  it('should set res property when configure strings action is sent', () => {
    expect(state).not.toHaveProperty('res');

    const updatedState = DGTableReducer(
      state,
      configureStrings({ testSection: { testId: 'test' } })
    );

    expect(updatedState).toHaveProperty('res');
    expect(updatedState.res).toEqual({ testSection: { testId: 'test' } });
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.dgtable.features).toEqual({});

    const updatedState = DGTableReducer(state, loadFeatureSwitches({}));

    expect(updatedState.features).toEqual({});
  });

  it('should set breadcrumb settings property when configure breadcrumb settings action is sent', () => {
    expect(state.dgtable.breadcrumbSettings).toEqual({});

    const updatedState = DGTableReducer(
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
