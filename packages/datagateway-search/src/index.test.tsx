import axios from 'axios';
import { MicroFrontendId, RegisterRouteType } from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import * as log from 'loglevel';
import { fetchSettings } from './';

jest.mock('loglevel');

describe('index - fetchSettings', () => {
  beforeEach(() => {
    global.document.dispatchEvent = jest.fn();
    global.CustomEvent = jest.fn();
  });
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
    (CustomEvent as jest.Mock).mockClear();
  });

  it('settings are loaded', async () => {
    const settingsResult = {
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
      selectAllSetting: false,
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
      pluginHost: 'http://localhost:3000/',
    };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );

    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(1);
    expect(CustomEvent).toHaveBeenLastCalledWith(MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section',
          link: 'link',
          plugin: 'datagateway-search',
          displayName: 'displayName',
          order: 0,
          helpSteps: [],
          logoLightMode: 'http://localhost:3000/' + LogoLight,
          logoDarkMode: 'http://localhost:3000/' + LogoDark,
          logoAltText: 'DataGateway',
        },
      },
    });
  });

  it('settings loaded and multiple routes registered with any helpSteps provided', async () => {
    const settingsResult = {
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
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
    };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );
    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(2);
    expect(CustomEvent).toHaveBeenNthCalledWith(1, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section0',
          link: 'link0',
          plugin: 'datagateway-search',
          displayName: 'displayName0',
          order: 0,
          helpSteps: [{ target: '#id', content: 'content' }],
          logoLightMode: undefined,
          logoDarkMode: undefined,
          logoAltText: 'DataGateway',
        },
      },
    });
    expect(CustomEvent).toHaveBeenNthCalledWith(2, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section1',
          link: 'link1',
          plugin: 'datagateway-search',
          displayName: 'displayName1',
          order: 1,
          helpSteps: [],
          logoLightMode: undefined,
          logoDarkMode: undefined,
          logoAltText: 'DataGateway',
        },
      },
    });
  });

  it('logs an error if facilityName is not defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          icatUrl: 'icat',
          selectAllSetting: true,
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: facilityName is undefined in settings'
    );
  });

  it('logs an error if any of the API URLs are not defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl, icatUrl) is undefined in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: Invalid format'
    );
  });

  it('logs an error if settings.json fails to be loaded with custom path', async () => {
    process.env.REACT_APP_SEARCH_BUILD_DIRECTORY = '/custom/directory/';
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /custom/directory/datagateway-search-settings.json: undefined'
    );
    delete process.env.REACT_APP_SEARCH_BUILD_DIRECTORY;
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: undefined'
    );
  });

  it('logs an error if no routes are defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          icatUrl: 'icat',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: No routes provided in the settings'
    );
  });

  it('logs an error if route has missing entries', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          icatUrl: 'icat',
          routes: [
            {
              section: 'section',
              link: 'link',
            },
          ],
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-search-settings.json: Route provided does not have all the required entries (section, link, displayName)'
    );
  });
});
