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
  getDatafileCount,
} from '../downloadApi';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';
import { Router } from 'react-router-dom';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory } from 'history';

jest.mock('../downloadApi');

describe('Download cart table component', () => {
  let shallow;
  let mount;
  let history;

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

  // Create our mocked datagateway-download settings file.
  const mockedSettings = {
    facilityName: 'LILS',
    apiUrl: 'https://example.com/api',
    downloadApiUrl: 'https://example.com/downloadApi',
    idsUrl: 'https://example.com/ids',
    fileCountMax: 5000,
    totalSizeMax: 1000000000000,
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

  const createWrapper = (): ReactWrapper => {
    return mount(
      <div id="datagateway-download">
        <Router history={history}>
          <DownloadSettingsContext.Provider value={mockedSettings}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </DownloadSettingsContext.Provider>
        </Router>
      </div>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    history = createMemoryHistory();
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
    (getDatafileCount as jest.Mock).mockImplementation(() =>
      Promise.resolve(7)
    );
  });

  afterEach(() => {
    mount.cleanUp();
    (fetchDownloadCartItems as jest.Mock).mockClear();
    (getSize as jest.Mock).mockClear();
    (getDatafileCount as jest.Mock).mockClear();
    (removeAllDownloadCartItems as jest.Mock).mockClear();
    (removeDownloadCartItem as jest.Mock).mockClear();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DownloadCartTable statusTabRedirect={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('fetches the download cart on load', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloadCartItems).toHaveBeenCalled();
  });

  it('does not fetch the download cart on load if no dg-download element exists', async () => {
    const wrapper = mount(
      <Router history={history}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </DownloadSettingsContext.Provider>
      </Router>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloadCartItems).not.toHaveBeenCalled();
  });

  it('calculates sizes once cart items have been fetched', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(getSize).toHaveBeenCalledTimes(4);
    expect(wrapper.find('[aria-colindex=3]').find('p').first().text()).toEqual(
      '1 B'
    );
    expect(wrapper.find('p#totalSizeDisplay').text()).toEqual(
      expect.stringContaining('downloadCart.total_size: 4 B')
    );
  });

  it('calculates total file count once cart items have been fetched', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(getDatafileCount).toHaveBeenCalled();
    expect(wrapper.find('p#fileCountDisplay').text()).toEqual(
      expect.stringContaining('downloadCart.number_of_files: 28')
    );
  });

  it('loads cart confirmation dialog when Download Cart button is clicked', async () => {
    const wrapper = createWrapper();

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
      .find('button[aria-label="downloadConfirmDialog.close_arialabel"]')
      .simulate('click');
  });

  it('removes all items from cart when Remove All button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.find('button#removeAllButton').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[data-testid="no-selections-message"]')).toBe(true);
  });

  it("removes an item when said item's remove button is clicked", async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.update();
      await flushPromises();
    });

    wrapper
      .find(`button[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]`)
      .simulate('click');

    expect(
      wrapper
        .find(
          `button[aria-label="downloadCart.remove {name:INVESTIGATION 2}"] svg`
        )
        .parent()
        .prop('color')
    ).toEqual('error');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(removeDownloadCartItem).toHaveBeenCalled();
    expect(removeDownloadCartItem).toHaveBeenCalledWith(2, 'investigation', {
      facilityName: mockedSettings.facilityName,
      downloadApiUrl: mockedSettings.downloadApiUrl,
    });
    expect(
      wrapper.exists(
        `[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]`
      )
    ).toBe(false);
    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
  });

  it('sorts data when headers are clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.update();
      await flushPromises();
    });

    const firstNameCell = wrapper.find('[aria-colindex=1]').find('p').first();

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
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.update();
      await flushPromises();
    });

    const nameFilterInput = wrapper
      .find('[aria-label="Filter by downloadCart.name"]')
      .first();
    nameFilterInput.instance().value = '1';
    nameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]'
      )
    ).toBe(false);

    const typeFilterInput = wrapper
      .find('[aria-label="Filter by downloadCart.type"]')
      .first();
    typeFilterInput.instance().value = 'data';
    typeFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadCart.remove {name:INVESTIGATION 1}"]'
      )
    ).toBe(false);

    typeFilterInput.instance().value = '';
    typeFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadCart.remove {name:INVESTIGATION 1}"]'
      )
    ).toBe(true);

    nameFilterInput.instance().value = '';
    nameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]'
      )
    ).toBe(true);
  });
});
