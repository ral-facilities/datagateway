import DGDataViewReducer, { initialState } from './dgdataview.reducer';
import { DGDataViewState } from '../app.types';
import {
  loadFeatureSwitches,
  loadBreadcrumbSettings,
  settingsLoaded,
  loadSelectAllSetting,
  loadPluginHostSetting,
  loadFacilityImageSetting,
} from '../actions';

describe('dgdataview reducer', () => {
  let state: DGDataViewState;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState));
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGDataViewReducer(state, {
      type: 'irrelevant action',
    });

    expect(updatedState).toBe(state);
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.settingsLoaded).toBe(false);

    const updatedState = DGDataViewReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.features).toEqual({});

    const updatedState = DGDataViewReducer(state, loadFeatureSwitches({}));

    expect(updatedState.features).toEqual({});
  });

  it('should set breadcrumb settings property when configure breadcrumb settings action is sent', () => {
    expect(state.breadcrumbSettings).toEqual([]);

    const updatedState = DGDataViewReducer(
      state,
      loadBreadcrumbSettings([
        {
          matchEntity: 'test',
          replaceEntityField: 'title',
        },
      ])
    );

    expect(updatedState.breadcrumbSettings).toEqual([
      {
        matchEntity: 'test',
        replaceEntityField: 'title',
      },
    ]);
  });

  it('should set selectAllSetting when configuring action is sent', () => {
    expect(state.selectAllSetting).toEqual(true);

    const updatedState = DGDataViewReducer(state, loadSelectAllSetting(false));

    expect(updatedState.selectAllSetting).toEqual(false);
  });

  it('should set pluginHostSetting when configuring action is sent', () => {
    expect(state.pluginHost).toEqual('');

    const updatedState = DGDataViewReducer(
      state,
      loadPluginHostSetting('http://localhost:3000')
    );

    expect(updatedState.pluginHost).toEqual('http://localhost:3000');
  });

  it('should set facilityImageSetting when configuring action is sent', () => {
    expect(state.facilityImageURL).toEqual('');

    const updatedState = DGDataViewReducer(
      state,
      loadFacilityImageSetting('test-image.jpg')
    );

    expect(updatedState.facilityImageURL).toEqual('test-image.jpg');
  });
});
