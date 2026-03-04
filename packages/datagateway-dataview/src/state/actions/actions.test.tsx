import {
  ConfigureFeatureSwitchesType,
  ConfigureQueryRetriesType,
  loadFacilityName,
  loadFeatureSwitches,
  loadQueryRetries,
  loadUrls,
} from 'datagateway-common';
import {
  configureApp,
  loadBreadcrumbSettings,
  loadFacilityImageSetting,
  loadPIRoleSetting,
  loadPluginHostSetting,
  settingsLoaded,
} from '.';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import {
  ConfigureBreadcrumbSettingsType,
  ConfigureFacilityImageSettingType,
  ConfigurePIRoleSettingType,
  ConfigurePluginHostSettingType,
  SettingsLoadedType,
} from './actions.types';

vi.mock('loglevel');

const mockSettingsGetter = vi.fn();
vi.mock('../../settings', () => ({
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

  it('given JSON loadBreadcrumbSettings returns a ConfigureBreadcrumbSettingsType with ConfigureBreadcrumbSettingsPayload', () => {
    const action = loadBreadcrumbSettings([
      {
        matchEntity: 'test',
        replaceEntity: 'testEntity',
        replaceEntityField: 'testField',
      },
    ]);
    expect(action.type).toEqual(ConfigureBreadcrumbSettingsType);
    expect(action.payload).toEqual({
      settings: [
        {
          matchEntity: 'test',
          replaceEntity: 'testEntity',
          replaceEntityField: 'testField',
        },
      ],
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

  it('given string loadPIRoleSetting returns a ConfigurePIRoleSettingType with ConfigurePIRoleSettingPayload', () => {
    const action = loadPIRoleSetting('principal_experimenter');
    expect(action.type).toEqual(ConfigurePIRoleSettingType);
    expect(action.payload).toEqual({
      settings: 'principal_experimenter',
    });
  });

  it('given undefined loadPIRoleSetting returns a ConfigurePIRoleSettingType with default ConfigurePIRoleSettingPayload', () => {
    const action = loadPIRoleSetting(undefined);
    expect(action.type).toEqual(ConfigurePIRoleSettingType);
    expect(action.payload).toEqual({
      settings: 'PI',
    });
  });

  it('settings are loaded and facilityName, loadFeatureSwitches, loadUrls, loadQueryRetries, loadBreadcrumbSettings, loadSelectAllSetting, loadPIRoleSetting and settingsLoaded actions are sent', async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      facilityImageURL: 'test-image.jpg',
      features: {},
      idsUrl: 'ids',
      apiUrl: 'api',
      doiMinterUrl: 'doi',
      dataCiteUrl: 'datacite',
      bioportalUrl: 'bioportalUrl',
      PIRole: 'principal_experimenter',
      queryRetries: 1,
      breadcrumbs: [
        {
          matchEntity: 'test',
          replaceEntityField: 'title',
        },
      ],
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
    await asyncAction(dispatch, getState, null);

    expect(actions.length).toEqual(9);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(loadFacilityImageSetting('test-image.jpg'));
    expect(actions).toContainEqual(loadFeatureSwitches({}));
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
        icatUrl: '',
        doiMinterUrl: 'doi',
        dataCiteUrl: 'datacite',
        bioportalUrl: 'bioportalUrl',
      })
    );
    expect(actions).toContainEqual(
      loadBreadcrumbSettings([
        {
          matchEntity: 'test',
          replaceEntityField: 'title',
        },
      ])
    );
    expect(actions).toContainEqual(settingsLoaded());
    expect(actions).toContainEqual(
      loadPluginHostSetting('http://localhost:3000/')
    );
    expect(actions).toContainEqual(loadQueryRetries(1));
    expect(actions).toContainEqual(loadPIRoleSetting('principal_experimenter'));
  });

  it("doesn't send loadQueryRetries, loadBreadcrumbSettings, loadPluginHostSetting, loadFacilityImageSetting and loadFeatureSwitches actions when they're not defined", async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
    });

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState, null);

    expect(actions.length).toEqual(4);
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
    expect(
      actions.every(({ type }) => type !== ConfigureQueryRetriesType)
    ).toBe(true);

    expect(actions).toContainEqual(loadPIRoleSetting(undefined));

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send any actions when settings are undefined", async () => {
    mockSettingsGetter.mockReturnValue(undefined);
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState, null);

    expect(actions.length).toEqual(0);
  });
});
