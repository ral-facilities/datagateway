import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DownloadTabs from './downloadTab.component';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

describe('DownloadTab', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();

    // Clear the session storage.
    sessionStorage.clear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DownloadTabs />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the previously used tab based on sessionStorage', async () => {
    let wrapper = mount(<DownloadTabs />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[aria-label="Download cart panel"]')).toBe(true);
    expect(
      wrapper.find('div[aria-label="Download cart panel"]').props().hidden
    ).toBe(false);

    // The tab index should be 0 for the cart tab.
    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('0');

    await act(async () => {
      wrapper.find('button[aria-label="Downloads tab"]').simulate('click');

      await flushPromises();
      wrapper.update();

      expect(
        wrapper.find('div[aria-label="Download status panel"]').props().hidden
      ).toBe(false);
    });

    // The tab index should be 1 for the download tab.
    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('1');

    // Recreate the wrapper and expect it to show the download tab.
    wrapper = mount(<DownloadTabs />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(sessionStorage.getItem('downloadStatusTab')).toEqual('1');
    expect(wrapper.exists('[aria-label="Download status panel"]')).toBe(true);
    expect(
      wrapper.find('div[aria-label="Download status panel"]').props().hidden
    ).toBe(false);
  });

  it('shows the appropriate table when clicking between tabs', async () => {
    const wrapper = mount(<DownloadTabs />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[aria-label="Download cart panel"]')).toBe(true);
    expect(
      wrapper.find('div[aria-label="Download cart panel"]').props().hidden
    ).toBe(false);

    expect(wrapper.exists('[aria-label="Download status panel"]')).toBe(true);
    expect(
      wrapper.find('div[aria-label="Download status panel"]').props().hidden
    ).toBe(true);

    // Click on the downloads tab and the refresh downloads button.
    await act(async () => {
      wrapper.find('button[aria-label="Downloads tab"]').simulate('click');

      await flushPromises();
      wrapper.update();

      expect(
        wrapper.find('div[aria-label="Download status panel"]').props().hidden
      ).toBe(false);

      expect(
        wrapper.exists('[aria-label="Refresh download status table"]')
      ).toBe(true);

      wrapper
        .find('button[aria-label="Refresh download status table"]')
        .simulate('click');

      await flushPromises();
      wrapper.update();
    });

    // Return back to the cart tab.
    await act(async () => {
      wrapper.find('button[aria-label="Cart tab"]').simulate('click');
      await flushPromises();
      wrapper.update();

      expect(
        wrapper.find('div[aria-label="Download status panel"]').props().hidden
      ).toBe(true);
    });
  });
});
