import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ConfigProvider, { DownloadSettingsContext } from './ConfigProvider';
import { flushPromises } from './setupTests';

jest.mock('loglevel');

const ConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(DownloadSettingsContext);

  // Return the settings in a div to inspect later in tests.
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
  });

  // Create a wrapper for our settings tests.
  const createWrapper = (): ReactWrapper => {
    return mount(
      <ConfigProvider>
        <ConfigTest />
      </ConfigProvider>
    );
  };

  it.only('settings (facilityName, URLs and accessMethods) are loaded', async () => {
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

    console.log(wrapper.find('#settings').text());
    expect(wrapper.find('#settings').text()).toEqual(
      JSON.stringify(settingsResult)
    );
  });

  it('logs an error if facilityName is not defined in the settings');
  it('logs an error if any of the API URLs are not defined in the settings');
  it(
    'logs an error if fails to load a settings.json and is still in a loading state'
  );
});
