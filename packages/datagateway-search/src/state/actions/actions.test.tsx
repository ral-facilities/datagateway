import { configureApp, settingsLoaded } from '.';
import { SettingsLoadedType } from './actions.types';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import { loadUrls, loadFacilityName } from 'datagateway-common';

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

  it('settings are loaded and facilityName, loadUrls and settingsLoaded actions are sent', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            facilityName: 'Generic',
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

  it('logs an error if facility name is not defined in settings.json and fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
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
      'Error loading datagateway-search-settings.json: facilityName is undefined in settings'
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
      'Error loading datagateway-search-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
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
        `Error loading datagateway-search-settings.json: `
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
      'Error loading datagateway-search-settings.json: Invalid format'
    );
  });
});
