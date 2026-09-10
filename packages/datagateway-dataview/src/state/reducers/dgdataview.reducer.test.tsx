import {
  loadBreadcrumbSettings,
  loadFacilityImageSetting,
  loadLandingPageLogoSetting,
  loadLocalContactRoleSetting,
  loadPIRoleSetting,
  loadPluginHostSetting,
  settingsLoaded,
} from '../actions';
import { DGDataViewState } from '../app.types';
import DGDataViewReducer, { initialState } from './dgdataview.reducer';

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

  it('should set landingPageLogo when configuring action is sent', () => {
    expect(state.landingPageLogo).toEqual(undefined);

    const updatedState = DGDataViewReducer(
      state,
      loadLandingPageLogoSetting('DLS')
    );

    expect(updatedState.landingPageLogo).toEqual('DLS');
  });

  it('should set loadPIRoleSetting when configuring action is sent', () => {
    expect(state.PIRole).toEqual('PI');

    const updatedState = DGDataViewReducer(
      state,
      loadPIRoleSetting('principal_experimenter')
    );

    expect(updatedState.PIRole).toEqual('principal_experimenter');
  });

  it('should set loadLocalContactRoleSetting when configuring action is sent', () => {
    expect(state.localContactRole).toEqual('local_contact|DataCollector');

    const updatedState = DGDataViewReducer(
      state,
      loadLocalContactRoleSetting('local_contact')
    );

    expect(updatedState.localContactRole).toEqual('local_contact');
  });
});
