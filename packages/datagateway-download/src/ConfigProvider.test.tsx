import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import log from 'loglevel';
import * as React from 'react';
import ConfigProvider, { DownloadSettingsContext } from './ConfigProvider';
import { flushPromises } from './setupTests';

vi.mock('loglevel');

const ConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(DownloadSettingsContext);

  // Return the settings as a string to inspect later in tests.
  return <div data-testid="settings">{JSON.stringify(settings)}</div>;
};

vi.mock('./settings', () => ({
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
  beforeEach(() => {
    global.document.dispatchEvent = vi.fn();
    global.CustomEvent = vi.fn();
  });

  afterEach(() => {
    vi.mocked(axios.get).mockClear();
    vi.mocked(log.error).mockClear();
    vi.mocked(CustomEvent).mockClear();
  });

  // Create a wrapper for our settings tests.
  const renderComponent = (): RenderResult =>
    render(
      <ConfigProvider>
        <ConfigTest />
      </ConfigProvider>
    );

  it('settings are loaded', async () => {
    renderComponent();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    // pretend settings has finished loading.
    await flushPromises();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByTestId('settings')).toBeInTheDocument();
      expect(screen.getByTestId('settings')).toHaveTextContent(
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
});
