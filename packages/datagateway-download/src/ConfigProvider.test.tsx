import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
import { ReactWrapper } from 'enzyme';
import * as log from 'loglevel';
import React from 'react';
import ConfigProvider, { DownloadSettingsContext } from './ConfigProvider';
import { flushPromises } from './setupTests';

jest.mock('loglevel');

const ConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(DownloadSettingsContext);

  // Return the settings as a string to inspect later in tests.
  return <div id="settings">{JSON.stringify(settings)}</div>;
};

jest.mock('./settings', () => ({
  settings: Promise.resolve({
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
    pluginHost: 'http://localhost:3000/',
  }),
}));

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

  it('settings are loaded', async () => {
    // Create the wrapper and wait for it to load.
    const wrapper = createWrapper();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    await flushPromises();
    wrapper.update();

    expect(wrapper.find('Preloader').prop('loading')).toBe(false);
    expect(wrapper.exists('#settings')).toBe(true);
    expect(wrapper.find('#settings').text()).toEqual(
      JSON.stringify({
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
        pluginHost: 'http://localhost:3000/',
      })
    );
  });
});
