import React from 'react';
import { mount, shallow } from 'enzyme';
import DownloadTabs from './downloadTab.component';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import { DownloadSettingsContext } from '../ConfigProvider';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ReactWrapper } from 'enzyme';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create our mocked datagateway-download settings file.
const mockedSettings = {
  facilityName: 'LILS',
  apiUrl: 'https://example.com/api',
  downloadApiUrl: 'https://example.com/downloadApi',
  idsUrl: 'https://example.com/ids',
  accessMethods: {
    https: {
      idsUrl: 'https://example.com/ids',
      displayName: 'HTTPS',
      description: 'Example description for HTTPS access method.',
    },
    globus: {
      idsUrl: 'https://example.com/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

describe('DownloadTab', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  const createWrapper = (): ReactWrapper => {
    const queryClient = new QueryClient();
    return mount(
      <Router history={history}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <QueryClientProvider client={queryClient}>
            <DownloadTabs />
          </QueryClientProvider>
        </DownloadSettingsContext.Provider>
      </Router>
    );
  };

  it('renders correctly', () => {
    const wrapper = shallow(<DownloadTabs />);
    expect(wrapper).toMatchSnapshot();
  });

  it('shows the appropriate table when clicking between tabs', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.exists('[aria-label="downloadTab.download_cart_panel_arialabel"]')
    ).toBe(true);
    expect(
      wrapper
        .find('div[aria-label="downloadTab.download_cart_panel_arialabel"]')
        .props().hidden
    ).toBe(false);

    expect(
      wrapper.exists(
        '[aria-label="downloadTab.download_status_panel_arialabel"]'
      )
    ).toBe(true);
    expect(
      wrapper
        .find('div[aria-label="downloadTab.download_status_panel_arialabel"]')
        .props().hidden
    ).toBe(true);

    // Click on the downloads tab and the refresh downloads button.
    await act(async () => {
      wrapper
        .find('button[aria-label="downloadTab.downloads_tab_arialabel"]')
        .simulate('click');

      await flushPromises();
      wrapper.update();

      expect(
        wrapper
          .find('div[aria-label="downloadTab.download_status_panel_arialabel"]')
          .props().hidden
      ).toBe(false);

      expect(
        wrapper.exists(
          '[aria-label="downloadTab.refresh_download_status_arialabel"]'
        )
      ).toBe(true);

      wrapper
        .find(
          'button[aria-label="downloadTab.refresh_download_status_arialabel"]'
        )
        .simulate('click');

      await flushPromises();
      wrapper.update();
    });

    // Return back to the cart tab.
    await act(async () => {
      wrapper
        .find('button[aria-label="downloadTab.cart_tab_arialabel"]')
        .simulate('click');
      await flushPromises();
      wrapper.update();

      expect(
        wrapper
          .find('div[aria-label="downloadTab.download_status_panel_arialabel"]')
          .props().hidden
      ).toBe(true);
    });
  });

  it('renders the selections tab on each mount', async () => {
    let wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Navigate to downloads tab
    await act(async () => {
      wrapper
        .find('button[aria-label="downloadTab.downloads_tab_arialabel"]')
        .simulate('click');

      await flushPromises();
      wrapper.update();
    });

    // Recreate the wrapper and expect it to show the selections tab.
    wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.exists('[aria-label="downloadTab.download_cart_panel_arialabel"]')
    ).toBe(true);
    expect(
      wrapper
        .find('div[aria-label="downloadTab.download_cart_panel_arialabel"]')
        .props().hidden
    ).toBe(false);
  });
});
