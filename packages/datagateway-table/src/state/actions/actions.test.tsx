import {
  configureStrings,
  loadFeatureSwitches,
  loadBreadcrumbSettings,
  configureApp,
  loadStrings,
  settingsLoaded,
} from '.';
import {
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
} from './actions.types';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import {
  fetchDownloadCartRequest,
  fetchDownloadCartSuccess,
  loadUrls,
  loadFacilityName,
} from 'datagateway-common';

jest.mock('loglevel');

describe('Actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
    resetActions();
  });

  it('settingsLoaded returns an action with SettingsLoadedType', () => {
    const action = settingsLoaded();
    expect(action.type).toEqual(SettingsLoadedType);
  });

  it('given JSON configureStrings returns a ConfigureStringsType with ConfigureStringsPayload', () => {
    const action = configureStrings({ testSection: { test: 'string' } });
    expect(action.type).toEqual(ConfigureStringsType);
    expect(action.payload).toEqual({
      res: { testSection: { test: 'string' } },
    });
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

  it('settings are loaded and facilityName, configureStrings, loadFeatureSwitches, loadUrls, loadBreadcrumbSettings and settingsLoaded actions are sent', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
            features: {},
            'ui-strings': '/res/default.json',
            idsUrl: 'ids',
            apiUrl: 'api',
            breadcrumbs: {
              test: {
                replaceEntityField: 'TITLE',
              },
            },
            downloadApiUrl: 'download-api',
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

    expect(actions.length).toEqual(8);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(loadFeatureSwitches({}));
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
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
    expect(actions).toContainEqual(fetchDownloadCartRequest());
    expect(actions).toContainEqual(fetchDownloadCartSuccess({}));
    expect(actions).toContainEqual(settingsLoaded());
  });

  it('settings are loaded despite no features and no leading slash on ui-strings', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
            'ui-strings': 'res/default.json',
            idsUrl: 'ids',
            apiUrl: 'api',
            downloadApiUrl: 'download-api',
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

    expect(actions.length).toEqual(6);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
      })
    );
    expect(actions).toContainEqual(fetchDownloadCartRequest());
    expect(actions).toContainEqual(fetchDownloadCartSuccess({}));
    expect(actions).toContainEqual(settingsLoaded());
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

  it('logs an error if loadStrings fails to resolve', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const path = 'non/existent/path';

    const asyncAction = loadStrings(path);
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Failed to read strings from ${path}: `)
    );
  });
});
