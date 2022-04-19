import {
  loadFeatureSwitches,
  loadBreadcrumbSettings,
  configureApp,
  settingsLoaded,
  loadSelectAllSetting,
  loadPluginHostSetting,
  loadFacilityImageSetting,
} from '.';
import {
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
  ConfigureSelectAllSettingType,
  ConfigurePluginHostSettingType,
  ConfigureFacilityImageSettingType,
} from './actions.types';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import { loadUrls, loadFacilityName } from 'datagateway-common';

jest.mock('loglevel');

const mockSettingsGetter = jest.fn();
jest.mock('../../settings', () => ({
  get settings() {
    return mockSettingsGetter();
  },
}));

describe('Actions', () => {
  afterEach(() => {
    mockSettingsGetter.mockReset();
    resetActions();
  });

  it('settingsLoaded returns an action with SettingsLoadedType', () => {
    const action = settingsLoaded();
    expect(action.type).toEqual(SettingsLoadedType);
  });

  it('given JSON loadFeatureSwitches returns a ConfigureFeatureSwitchesType with ConfigureFeatureSwitchesPayload', () => {
    const action = loadFeatureSwitches({});
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload).toEqual({
      switches: {},
    });
  });

  it('given JSON loadBreadcrumbSettings returns a ConfigureBreadcrumbSettingsType with ConfigureBreadcrumbSettingsPayload', () => {
    const action = loadBreadcrumbSettings({
      test: {
        replaceEntity: 'testEntity',
        replaceEntityField: 'testField',
      },
    });
    expect(action.type).toEqual(ConfigureBreadcrumbSettingsType);
    expect(action.payload).toEqual({
      settings: {
        test: {
          replaceEntity: 'testEntity',
          replaceEntityField: 'testField',
        },
      },
    });
  });

  it('given JSON loadSelectAllSetting returns a ConfigureSelectAllSettingType with ConfigureSelectAllSettingPayload', () => {
    const action = loadSelectAllSetting(false);
    expect(action.type).toEqual(ConfigureSelectAllSettingType);
    expect(action.payload).toEqual({
      settings: false,
    });
  });

  it('given JSON loadPluginHostSetting returns a ConfigurePluginHostSettingType with ConfigurePluginHostSettingPayload', () => {
    const action = loadPluginHostSetting('http://localhost:3000');
    expect(action.type).toEqual(ConfigurePluginHostSettingType);
    expect(action.payload).toEqual({
      settings: 'http://localhost:3000',
    });
  });

  it('given JSON loadFacilityImageSetting returns a ConfigureFacilityImageSettingType with ConfigureFacilityImageSettingPayload', () => {
    const action = loadFacilityImageSetting('test-image.jpg');
    expect(action.type).toEqual(ConfigureFacilityImageSettingType);
    expect(action.payload).toEqual({
      settings: 'test-image.jpg',
    });
  });

  it('settings are loaded and facilityName, loadFeatureSwitches, loadUrls, loadBreadcrumbSettings, loadSelectAllSetting and settingsLoaded actions are sent', async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      facilityImageURL: 'test-image.jpg',
      features: {},
      idsUrl: 'ids',
      apiUrl: 'api',
      breadcrumbs: {
        test: {
          replaceEntityField: 'title',
        },
      },
      downloadApiUrl: 'download-api',
      selectAllSetting: false,
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
      pluginHost: 'http://localhost:3000/',
    });
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(8);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(loadFacilityImageSetting('test-image.jpg'));
    expect(actions).toContainEqual(loadFeatureSwitches({}));
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
        icatUrl: '',
      })
    );
    expect(actions).toContainEqual(
      loadBreadcrumbSettings({
        test: {
          replaceEntityField: 'title',
        },
      })
    );
    expect(actions).toContainEqual(settingsLoaded());
    expect(actions).toContainEqual(loadSelectAllSetting(false));
    expect(actions).toContainEqual(
      loadPluginHostSetting('http://localhost:3000/')
    );
  });

  it("doesn't send loadSelectAllSetting, loadBreadcrumbSettings, loadPluginHostSetting, loadFacilityImageSetting and loadFeatureSwitches actions when they're not defined", async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
    });

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(3);
    expect(
      actions.every(({ type }) => type !== ConfigureSelectAllSettingType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureBreadcrumbSettingsType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureFeatureSwitchesType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigurePluginHostSettingType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureFacilityImageSettingType)
    ).toBe(true);

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send any actions when settings are undefined", async () => {
    mockSettingsGetter.mockReturnValue(undefined);
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(0);
  });
});
