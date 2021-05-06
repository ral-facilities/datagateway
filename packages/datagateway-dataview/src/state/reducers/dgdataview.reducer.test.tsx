import DGDataViewReducer, { initialState } from './dgdataview.reducer';
import { StateType } from '../app.types';
import {
  loadFeatureSwitches,
  loadBreadcrumbSettings,
  settingsLoaded,
  loadSelectAllSetting,
  loadHomepageStrings,
} from '../actions';
import { HomepageContents } from 'datagateway-common';

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

  it('should set selectAllSetting when configuring action is sent', () => {
    expect(state.dgdataview.selectAllSetting).toEqual(true);

    const updatedState = DGDataViewReducer(state, loadSelectAllSetting(false));

    expect(updatedState.selectAllSetting).toEqual(false);
  });

  it('should set homepage strings when configure homepage strings action is sent', () => {
    expect(state.dgdataview.res).toEqual(undefined);
    const testHomepageContents: HomepageContents = {
      title: 'title',
      howLabel: 'howLabel',
      exploreLabel: 'exploreLabel',
      exploreDescription: 'exploreDescription',
      discoverLabel: 'discoverLabel',
      discoverDescription: 'discoverDescription',
      downloadLabel: 'downloadLabel',
      downloadDescription: 'downloadDescription',
    };
    const updatedState = DGDataViewReducer(
      state,
      loadHomepageStrings(testHomepageContents)
    );

    expect(updatedState.res).toEqual(testHomepageContents);
  });
});
