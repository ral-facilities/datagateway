import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
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
  // TODO: Use shallow?
  let mount;

  beforeEach(() => {
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();

    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
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
      accessMethods: {
        https: {
          idsUrl: 'https-ids',
          displayName: 'HTTPS',
          description: 'HTTP description',
        },
      },
    };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // console.log(wrapper.find('#settings').text());
    expect(wrapper.find('#settings').text()).toEqual(
      JSON.stringify(settingsResult)
    );
  });

  it('logs an error if facilityName is not defined in the settings', async () => {
    // const settingsResult = {
    //   idsUrl: 'ids',
    //   apiUrl: 'api',
    //   downloadApiUrl: 'download-api',
    //   accessMethods: {
    //     https: {
    //       idsUrl: 'https-ids',
    //       displayName: 'HTTPS',
    //       description: 'HTTP description',
    //     },
    //   },
    // };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download-api',
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

    // console.log(wrapper.find('#settings'));
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
    // const settingsResult = {
    //   facilityName: 'Generic',
    //   accessMethods: {
    //     https: {
    //       idsUrl: 'https-ids',
    //       displayName: 'HTTPS',
    //       description: 'HTTP description',
    //     },
    //   },
    // };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'Generic',
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

    // console.log(wrapper.find('#settings'));
    expect(wrapper.exists('#settings')).toBe(false);

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
        },
      })
    );

    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // console.log(wrapper.find('#settings'));
    expect(wrapper.exists('#settings')).toBe(false);

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

    // console.log(wrapper.find('#settings'));
    expect(wrapper.exists('#settings')).toBe(false);
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

    // console.log(wrapper.find('#settings'));
    expect(wrapper.exists('#settings')).toBe(false);
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

    // console.log(wrapper.find('#settings'));
    expect(wrapper.exists('#settings')).toBe(false);

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading datagateway-download-settings.json: Invalid format'
    );
  });

  // it(
  //   'logs an error if fails to load a settings.json and is still in a loading state'
  // );
});
