import {
  loadFeatureSwitches,
  loadBreadcrumbSettings,
  configureApp,
  settingsLoaded,
  loadSelectAllSetting,
} from '.';
import {
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
  ConfigureSelectAllSettingType,
} from './actions.types';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import {
  loadUrls,
  loadFacilityName,
  MicroFrontendId,
  RegisterRouteType,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';

jest.mock('loglevel');

describe('Actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockReset();
    (log.error as jest.Mock).mockReset();
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

  it('settings are loaded and facilityName, loadFeatureSwitches, loadUrls, loadBreadcrumbSettings and settingsLoaded actions are sent', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
            features: {},
            idsUrl: 'ids',
            apiUrl: 'api',
            breadcrumbs: {
              test: {
                replaceEntityField: 'TITLE',
              },
            },
            downloadApiUrl: 'download-api',
            selectAllSetting: false,
            routes: [
              {
                section: 'section',
                link: 'link',
                displayName: 'displayName',
                order: 0,
              },
            ],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );
    const spy = jest.spyOn(document, 'dispatchEvent');

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(6);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(loadFeatureSwitches({}));
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
      })
    );
    expect(actions).toContainEqual(
      loadBreadcrumbSettings({
        test: {
          replaceEntityField: 'TITLE',
        },
      })
    );
    expect(actions).toContainEqual(settingsLoaded());
    expect(actions).toContainEqual(loadSelectAllSetting(false));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: RegisterRouteType,
          payload: {
            section: 'section',
            link: 'link',
            plugin: 'datagateway-dataview',
            displayName: 'displayName',
            order: 0,
            helpSteps: [],
            logoLightMode: LogoLight,
            logoDarkMode: LogoDark,
            logoAltText: 'DataGateway',
          },
        },
      })
    );
    spy.mockClear();
  });

  it('settings are loaded despite no features', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
            idsUrl: 'ids',
            apiUrl: 'api',
            downloadApiUrl: 'download-api',
            routes: [],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(3);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
      })
    );
    expect(actions).toContainEqual(settingsLoaded());
  });

  it('settings loaded and multiple routes registered with any helpSteps provided', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
            features: {},
            idsUrl: 'ids',
            apiUrl: 'api',
            breadcrumbs: {
              test: {
                replaceEntityField: 'TITLE',
              },
            },
            downloadApiUrl: 'download-api',
            selectAllSetting: false,
            routes: [
              {
                section: 'section0',
                link: 'link0',
                displayName: 'displayName0',
                order: 0,
              },
              {
                section: 'section1',
                link: 'link1',
                displayName: 'displayName1',
                order: 1,
              },
            ],
            helpSteps: [{ target: '#id', content: 'content' }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );
    const spy = jest.spyOn(document, 'dispatchEvent');

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(
      1,
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: RegisterRouteType,
          payload: {
            section: 'section0',
            link: 'link0',
            plugin: 'datagateway-dataview',
            displayName: 'displayName0',
            order: 0,
            helpSteps: [{ target: '#id', content: 'content' }],
            logoLightMode: LogoLight,
            logoDarkMode: LogoDark,
            logoAltText: 'DataGateway',
          },
        },
      })
    );
    expect(spy).toHaveBeenNthCalledWith(
      2,
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: RegisterRouteType,
          payload: {
            section: 'section1',
            link: 'link1',
            plugin: 'datagateway-dataview',
            displayName: 'displayName1',
            order: 0,
            helpSteps: [],
            logoLightMode: LogoLight,
            logoDarkMode: LogoDark,
            logoAltText: 'DataGateway',
          },
        },
      })
    );
    spy.mockClear();
  });

  it('logs an error if facility name is not defined in settings.json and fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {},
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-dataview-settings.json: facilityName is undefined in settings'
    );
  });

  it('logs an error if urls are not defined in settings.json and fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
        },
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-dataview-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
    );
  });

  it('logs an error if no routes are defined in settings.json and fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
        },
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-dataview-settings.json: No routes provided in the settings'
    );
  });

  it('logs an error if settings.json fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(
        `Error loading datagateway-dataview-settings.json: `
      )
    );
  });

  it('logs an error if settings.json is invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-dataview-settings.json: Invalid format'
    );
  });
});
