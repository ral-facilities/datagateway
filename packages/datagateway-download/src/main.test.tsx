import axios from 'axios';
import { MicroFrontendId, RegisterRouteType } from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import log from 'loglevel';
import { fetchSettings } from './main';

vi.mock('loglevel');

describe('index - fetchSettings', () => {
  beforeEach(() => {
    global.document.dispatchEvent = vi.fn();
    global.CustomEvent = vi.fn();
  });
  afterEach(() => {
    vi.mocked(axios.get).mockClear();
    vi.mocked(log.error).mockClear();
    vi.mocked(CustomEvent).mockClear();
  });

  it('settings (facilityName & URLs) are loaded', async () => {
    const settingsResult = {
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      dataCiteUrl: 'datacite',
      doiMinterUrl: 'doi-minter',
      fileCountMax: 5000,
      totalSizeMax: 1000000000000,
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
      pluginHost: 'http://localhost:3000/',
    };

    vi.mocked(axios.get).mockImplementationOnce(() =>
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
          plugin: 'datagateway-download',
          displayName: 'displayName',
          admin: false,
          hideFromMenu: false,
          unauthorised: false,
          order: 0,
          helpSteps: [],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
          logoAltText: 'DataGateway',
        },
      },
    });
  });

  it('settings loaded and multiple routes registered with any helpSteps provided and null urls changed to undefined', async () => {
    const settingsResult = {
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      doiMinterUrl: null,
      dataCiteUrl: null,
      fileCountMax: 5000,
      totalSizeMax: 1000000000000,
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
          hideFromMenu: true,
          unauthorised: true,
          order: 1,
        },
        {
          section: 'admin0',
          link: 'link0',
          displayName: 'displayNameAdmin0',
          admin: true,
          order: 0,
        },
      ],
      helpSteps: [{ target: '#id', content: 'content' }],
    };

    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );
    const settings = await fetchSettings();

    const { dataCiteUrl, doiMinterUrl, ...expectedSettingsResult } =
      settingsResult;

    expect(JSON.stringify(settings)).toEqual(
      JSON.stringify(expectedSettingsResult)
    );
    expect(CustomEvent).toHaveBeenCalledTimes(3);
    expect(CustomEvent).toHaveBeenNthCalledWith(1, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section0',
          link: 'link0',
          plugin: 'datagateway-download',
          displayName: 'displayName0',
          admin: false,
          hideFromMenu: false,
          unauthorised: false,
          order: 0,
          helpSteps: [{ target: '#id', content: 'content' }],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
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
          plugin: 'datagateway-download',
          displayName: 'displayName1',
          admin: false,
          hideFromMenu: true,
          unauthorised: true,
          order: 1,
          helpSteps: [],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
          logoAltText: 'DataGateway',
        },
      },
    });
    expect(CustomEvent).toHaveBeenNthCalledWith(3, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'admin0',
          link: 'link0',
          plugin: 'datagateway-download',
          displayName: 'displayNameAdmin0',
          admin: true,
          hideFromMenu: false,
          unauthorised: false,
          order: 0,
          helpSteps: [],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
          logoAltText: 'DataGateway',
        },
      },
    });
  });

  it('logs an error if facilityName is not defined in the settings', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: facilityName is undefined in settings'
    );
  });

  it('logs an error if any of the API URLs are not defined in the settings', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: Invalid format'
    );
  });

  it('logs an error if settings.json fails to be loaded with custom path', async () => {
    import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY = '/custom/directory/';
    vi.mocked(axios.get).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /custom/directory/datagateway-download-settings.json: undefined'
    );
    delete import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY;
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: undefined'
    );
  });

  it('logs an error if no routes are defined in the settings', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: No routes provided in the settings'
    );
  });

  it('logs an error if route has missing entries', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          routes: [
            {
              section: 'section',
              link: 'link',
              order: 0,
            },
          ],
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /datagateway-download-settings.json: Route provided does not have all the required entries (section, link, displayName)'
    );
  });
});
