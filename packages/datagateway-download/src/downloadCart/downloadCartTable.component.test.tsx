import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DownloadCartTable from './downloadCartTable.component';
import { DownloadCartItem } from 'datagateway-common';
import { flushPromises } from '../setupTests';
import {
  fetchDownloadCartItems,
  removeAllDownloadCartItems,
  removeDownloadCartItem,
  getSize,
  getCartDatafileCount,
} from '../downloadApi';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';

jest.mock('../downloadApi');
jest.useFakeTimers();

describe('Download cart table component', () => {
  let shallow;
  let mount;

  const cartItems: DownloadCartItem[] = [
    {
      entityId: 1,
      entityType: 'investigation',
      id: 1,
      name: 'INVESTIGATION 1',
      parentEntities: [],
    },
    {
      entityId: 2,
      entityType: 'investigation',
      id: 2,
      name: 'INVESTIGATION 2',
      parentEntities: [],
    },
    {
      entityId: 3,
      entityType: 'dataset',
      id: 3,
      name: 'DATASET 1',
      parentEntities: [],
    },
    {
      entityId: 4,
      entityType: 'datafile',
      id: 4,
      name: 'DATAFILE 1',
      parentEntities: [],
    },
  ];

  (fetchDownloadCartItems as jest.Mock).mockImplementation(() =>
    Promise.resolve(cartItems)
  );

  (removeAllDownloadCartItems as jest.Mock).mockImplementation(() =>
    Promise.resolve()
  );

  (removeDownloadCartItem as jest.Mock).mockImplementation(() =>
    Promise.resolve()
  );

  (getSize as jest.Mock).mockImplementation(() => Promise.resolve(1));

  (getCartDatafileCount as jest.Mock).mockImplementation(() =>
    Promise.resolve(7)
  );

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

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
    (fetchDownloadCartItems as jest.Mock).mockClear();
    (getSize as jest.Mock).mockClear();
    (getCartDatafileCount as jest.Mock).mockClear();
    (removeAllDownloadCartItems as jest.Mock).mockClear();
    (removeDownloadCartItem as jest.Mock).mockClear();
    jest.clearAllTimers();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DownloadCartTable statusTabRedirect={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('fetches the download cart on load', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloadCartItems).toHaveBeenCalled();
  });

  it('calculates sizes once cart items have been fetched', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(getSize).toHaveBeenCalledTimes(4);
    expect(
      wrapper
        .find('[aria-colindex=3]')
        .find('p')
        .first()
        .text()
    ).toEqual('1 B');
    expect(wrapper.find('p#totalSizeDisplay').text()).toEqual(
      expect.stringContaining('Total size: 4 B')
    );
  });

  it('calculates total file count once cart items have been fetched', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(getCartDatafileCount).toHaveBeenCalled();
    expect(wrapper.find('p#fileCountDisplay').text()).toEqual(
      expect.stringContaining('Number of files: 7')
    );
  });

  // TODO: If I place a axios response here for status call, why is it undefined?
  it('loads cart confirmation dialog when Download Cart button is clicked', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    expect(wrapper.find('button#downloadCartButton').prop('disabled')).toBe(
      true
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('button#downloadCartButton').prop('disabled')).toBe(
      false
    );

    wrapper.find('button#downloadCartButton').simulate('click');

    // Update the wrapper with the loading dialog.
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Update the wrapper with the download confirmation dialog.
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[aria-labelledby="downloadCartConfirmation"]')).toBe(
      true
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Close the confirmation dialog.
    wrapper
      .find('button[aria-label="download-confirmation-close"]')
      .simulate('click');
  });

  it('calls clearCart function once the download cart is closed', async () => {});

  it('removes all items from cart when Remove All button is clicked', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.find('button#removeAllButton').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(removeAllDownloadCartItems).toHaveBeenCalled();
    expect(wrapper.exists('[role="gridcell"]')).toBe(false);
    expect(wrapper.exists('[aria-rowcount=0]')).toBe(true);
  });

  it("removes an item when said item's remove button is clicked", async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('button[aria-label="Remove INVESTIGATION 2 from cart"]')
      .simulate('click');

    expect(
      wrapper
        .find('button[aria-label="Remove INVESTIGATION 2 from cart"] svg')
        .parent()
        .prop('color')
    ).toEqual('error');

    await act(async () => {
      jest.runAllTimers();
      await flushPromises();
      wrapper.update();
    });

    expect(removeDownloadCartItem).toHaveBeenCalled();
    expect(removeDownloadCartItem).toHaveBeenCalledWith(2, 'investigation', {
      facilityName: mockedSettings.facilityName,
      downloadApiUrl: mockedSettings.downloadApiUrl,
    });
    expect(
      wrapper.exists('[aria-label="Remove INVESTIGATION 2 from cart"]')
    ).toBe(false);
    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
  });

  it('sorts data when headers are clicked', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const firstNameCell = wrapper
      .find('[aria-colindex=1]')
      .find('p')
      .first();

    const typeSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(1);

    typeSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('DATAFILE 1');

    typeSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('INVESTIGATION 1');

    const nameSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(0);

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('INVESTIGATION 1');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('INVESTIGATION 2');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('INVESTIGATION 1');
  });

  it('filters data when text fields are typed into', async () => {
    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadCartTable statusTabRedirect={jest.fn()} />
      </DownloadSettingsContext.Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const nameFilterInput = wrapper.find('[aria-label="Filter by Name"] input');
    nameFilterInput.instance().value = '1';
    nameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove INVESTIGATION 2 from cart"]')
    ).toBe(false);

    const typeFilterInput = wrapper.find('[aria-label="Filter by Type"] input');
    typeFilterInput.instance().value = 'data';
    typeFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove INVESTIGATION 1 from cart"]')
    ).toBe(false);

    typeFilterInput.instance().value = '';
    typeFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove INVESTIGATION 1 from cart"]')
    ).toBe(true);

    nameFilterInput.instance().value = '';
    nameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove INVESTIGATION 2 from cart"]')
    ).toBe(true);
  });
});
