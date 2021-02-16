import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
import { MicroFrontendId, RegisterRouteType } from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import { ReactWrapper } from 'enzyme';
import * as log from 'loglevel';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ConfigProvider, { DownloadSettingsContext } from './ConfigProvider';
import { flushPromises } from './setupTests';

jest.mock('loglevel');

const ConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(DownloadSettingsContext);

  // Return the settings as a string to inspect later in tests.
  return <div id="settings">{JSON.stringify(settings)}</div>;
};

describe('ConfigProvider', () => {
  let mount;

  beforeEach(() => {
    mount = createMount();
    global.document.dispatchEvent = jest.fn();
    global.CustomEvent = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();

    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
    (CustomEvent as jest.Mock).mockClear();
  });

  // Create a wrapper for our settings tests.
  const createWrapper = (): ReactWrapper => {
    return mount(
      <ConfigProvider>
        <ConfigTest />
      </ConfigProvider>
    );
  };

  it('settings (facilityName, URLs and accessMethods) are loaded', async () => {
    const settingsResult = {
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      fileCountMax: 5000,
      totalSizeMax: 1000000000000,
      accessMethods: {
        https: {
          idsUrl: 'https-ids',
          displayName: 'HTTPS',
          description: 'HTTP description',
        },
      },
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
    };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('Preloader').prop('loading')).toBe(false);
    expect(wrapper.exists('#settings')).toBe(true);
    expect(wrapper.find('#settings').text()).toEqual(
      JSON.stringify(settingsResult)
    );
    expect(CustomEvent).toHaveBeenCalledTimes(1);
    expect(CustomEvent).toHaveBeenLastCalledWith(MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section',
          link: 'link',
          plugin: 'datagateway-download',
          displayName: '\xa0displayName',
          order: 0,
          helpSteps: [],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
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
      fileCountMax: 5000,
      totalSizeMax: 1000000000000,
      accessMethods: {
        https: {
          idsUrl: 'https-ids',
          displayName: 'HTTPS',
          description: 'HTTP description',
        },
      },
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

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('Preloader').prop('loading')).toBe(false);
    expect(wrapper.exists('#settings')).toBe(true);
    expect(wrapper.find('#settings').text()).toEqual(
      JSON.stringify(settingsResult)
    );
    expect(CustomEvent).toHaveBeenCalledTimes(2);
    expect(CustomEvent).toHaveBeenNthCalledWith(1, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section0',
          link: 'link0',
          plugin: 'datagateway-download',
          displayName: '\xa0displayName0',
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
          displayName: '\xa0displayName1',
          order: 1,
          helpSteps: [],
          logoLightMode: LogoLight,
          logoDarkMode: LogoDark,
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
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
          },
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the wrapper to be empty (with no settings)
    // and the appropriate error to have been logged.
    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: facilityName is undefined in settings'
    );
  });

  it('logs an error if any of the API URLs are not defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
          },
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
    );
  });

  it('logs an error if accessMethods is undefined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: accessMethods is undefined in settings'
    );
  });

  it('logs an error if there are no access methods defined within the accessMethods object in settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
            globus: {
              displayName: 'Globus',
              description: 'Globus description',
            },
          },
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: Access method globus, defined in settings, does not contain a idsUrl'
    );
  });

  it('logs an error if there is no idsUrl defined in any access method in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {},
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: At least one access method should be defined under accessMethods in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: Invalid format'
    );
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: undefined'
    );
  });

  it('logs an error if fileCountMax or totalSizeMax are undefined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
            globus: {
              displayName: 'Globus',
              description: 'Globus description',
            },
          },
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: fileCountMax or totalSizeMax is undefined in settings'
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
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
            globus: {
              idsUrl: 'https-ids',
              displayName: 'Globus',
              description: 'Globus description',
            },
          },
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: No routes provided in the settings'
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
          accessMethods: {
            https: {
              idsUrl: 'https-ids',
              displayName: 'HTTPS',
              description: 'HTTP description',
            },
            globus: {
              idsUrl: 'https-ids',
              displayName: 'Globus',
              description: 'Globus description',
            },
          },
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
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

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#settings')).toBe(false);
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: Route provided does not have all the required entries (section, link, displayName)'
    );
  });
});
