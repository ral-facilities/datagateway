import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DownloadTabs from './downloadTab.component';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import { DownloadSettingsContext } from '../ConfigProvider';
import { LinearProgress } from '@material-ui/core';
import { dGCommonInitialState, DGCommonState } from 'datagateway-common';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
// import { mount, ReactWrapper } from 'enzyme';

// Create our mocked datagateway-download settings file.
const mockedSettings = {
  facilityName: 'LILS',
  apiUrl: 'http://scigateway-preprod.esc.rl.ac.uk:5000',
  downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
  idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
  accessMethods: {
    https: {
      idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
      displayName: 'HTTPS',
      description: 'Example description for HTTPS access method.',
    },
    globus: {
      idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

describe('DownloadTab', () => {
  let shallow;
  let mount;
  let state: DGCommonState;

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState },
        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();

    // Clear the session storage.
    sessionStorage.clear();
  });

  it('renders correctly', () => {
    const mockStore = configureStore([thunk]);
    const wrapper = shallow(<DownloadTabs store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the previously used tab based on sessionStorage', async () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    let wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadTabs store={testStore} />
      </DownloadSettingsContext.Provider>
    );

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

    // The tab index should be 0 for the cart tab.
    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('0');

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
    });

    // The tab index should be 1 for the download tab.
    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('1');

    // Recreate the wrapper and expect it to show the download tab.
    wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadTabs store={testStore} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('1');
    expect(
      wrapper.exists(
        '[aria-label="downloadTab.download_status_panel_arialabel"]'
      )
    ).toBe(true);
    expect(
      wrapper
        .find('div[aria-label="downloadTab.download_status_panel_arialabel"]')
        .props().hidden
    ).toBe(false);
  });

  it('shows the appropriate table when clicking between tabs', async () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadTabs store={testStore} />
      </DownloadSettingsContext.Provider>
    );

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

  it('do not display loading bar loading false', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadTabs store={testStore} />
      </DownloadSettingsContext.Provider>
    );

    expect(wrapper.exists(LinearProgress)).toBeFalsy();
  });

  it('display loading bar when loading true', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState, loading: true },
        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );

    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadTabs store={testStore} />
      </DownloadSettingsContext.Provider>
    );

    expect(wrapper.exists(LinearProgress)).toBeTruthy();
  });
});
