import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import DownloadCartTable from './downloadCartTable.component';
import {
  DownloadCartItem,
  fetchDownloadCart,
  removeFromCart,
} from 'datagateway-common';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { QueryClientProvider, QueryClient } from 'react-query';
import {
  getDatafileCount,
  getSize,
  removeAllDownloadCartItems,
} from '../downloadApi';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    fetchDownloadCart: jest.fn(),
    removeFromCart: jest.fn(),
  };
});

jest.mock('../downloadApi', () => {
  const originalModule = jest.requireActual('../downloadApi');

  return {
    ...originalModule,
    removeAllDownloadCartItems: jest.fn(),
    getSize: jest.fn(),
    getDatafileCount: jest.fn(),
    getIsTwoLevel: jest.fn().mockResolvedValue(true),
  };
});

describe('Download cart table component', () => {
  let history, holder, queryClient;
  let cartItems: DownloadCartItem[] = [];

  // Create our mocked datagateway-download settings file.
  let mockedSettings = {
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
    queryClient = new QueryClient();
    return mount(
      <Router history={history}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <QueryClientProvider client={queryClient}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </QueryClientProvider>
        </DownloadSettingsContext.Provider>
      </Router>,
      { attachTo: holder }
    );
  };

  beforeEach(() => {
    history = createMemoryHistory();

    //https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    cartItems = [
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

    (fetchDownloadCart as jest.MockedFunction<
      typeof fetchDownloadCart
    >).mockResolvedValue(cartItems);
    (removeAllDownloadCartItems as jest.MockedFunction<
      typeof removeAllDownloadCartItems
    >).mockResolvedValue(null);
    (removeFromCart as jest.MockedFunction<
      typeof removeFromCart
    >).mockImplementation((entityType, entityIds) => {
      cartItems = cartItems.filter(
        (item) => !entityIds.includes(item.entityId)
      );
      return Promise.resolve(cartItems);
    });

    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValue(1);
    (getDatafileCount as jest.MockedFunction<
      typeof getDatafileCount
    >).mockResolvedValue(7);
  });

  afterEach(() => {
    if (holder) document.body.removeChild(holder);
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders no cart message correctly', async () => {
    (fetchDownloadCart as jest.MockedFunction<
      typeof fetchDownloadCart
    >).mockResolvedValue([]);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[data-testid="no-selections-message"]')).toBe(true);
  });

  it('renders no cart message correctly', async () => {
    (fetchDownloadCart as jest.MockedFunction<
      typeof fetchDownloadCart
    >).mockResolvedValue([]);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[data-testid="no-selections-message"]')).toBe(true);
  });

  it('fetches the download cart on load', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloadCart).toHaveBeenCalled();
    expect(wrapper.find('[aria-colindex=1]').find('p').first().text()).toEqual(
      'INVESTIGATION 1'
    );
  });

  it('does not fetch the download cart on load if no dg-download element exists', async () => {
    holder.setAttribute('id', 'test');
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloadCart).not.toHaveBeenCalled();
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

    expect(getDatafileCount).toHaveBeenCalledTimes(3);
    expect(wrapper.find('[aria-colindex=4]').find('p').first().text()).toEqual(
      '7'
    );
    // datafiles should always be 1 and shouldn't call getDatafileCount
    expect(wrapper.find('[aria-colindex=4]').find('p').last().text()).toEqual(
      '1'
    );

    expect(wrapper.find('p#fileCountDisplay').text()).toEqual(
      expect.stringContaining('downloadCart.number_of_files: 22 / 5000')
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

  it('disables remove all button while request is processing', async () => {
    // use this to manually resolve promise
    let promiseResolve;

    (removeAllDownloadCartItems as jest.MockedFunction<
      typeof removeAllDownloadCartItems
    >).mockImplementation(
      () =>
        new Promise((resolve) => {
          promiseResolve = resolve;
        })
    );

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
    expect(
      wrapper.find('button#removeAllButton').prop('disabled')
    ).toBeTruthy();

    await act(async () => {
      promiseResolve();
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[data-testid="no-selections-message"]')).toBe(true);
  });

  it('disables download button when there are empty items in the cart ', async () => {
    (getSize as jest.MockedFunction<typeof getSize>)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);
    (getDatafileCount as jest.MockedFunction<
      typeof getDatafileCount
    >).mockResolvedValueOnce(0);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('div#emptyFilesAlert')).toBeTruthy();
    expect(
      wrapper.find('button#downloadCartButton').prop('disabled')
    ).toBeTruthy();

    wrapper
      .find(`button[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]`)
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('div#emptyFilesAlert')).toBeTruthy();
    expect(
      wrapper.find('button#downloadCartButton').prop('disabled')
    ).toBeTruthy();

    wrapper
      .find(`button[aria-label="downloadCart.remove {name:INVESTIGATION 1}"]`)
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('div#emptyFilesAlert')).toBeFalsy();
    expect(
      wrapper.find('button#downloadCartButton').prop('disabled')
    ).toBeFalsy();
  });

  it("removes an item when said item's remove button is clicked", async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper
        .find(`button[aria-label="downloadCart.remove {name:INVESTIGATION 2}"]`)
        .simulate('click');

      await flushPromises();
      wrapper.update();
    });

    expect(removeFromCart).toHaveBeenCalled();
    expect(removeFromCart).toHaveBeenCalledWith('investigation', [2], {
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
      .last();
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
      .last();
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

  it('displays error alert if file/size limit exceeded', async () => {
    let wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Make sure alerts are not displayed if under the limits
    expect(wrapper.exists('div#fileLimitAlert')).toBeFalsy();
    expect(wrapper.exists('div#sizeLimitAlert')).toBeFalsy();

    const oldSettings = mockedSettings;
    mockedSettings = {
      ...oldSettings,
      totalSizeMax: 1,
    };

    wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Make sure size limit alert is displayed if over the limit
    expect(wrapper.exists('div#sizeLimitAlert')).toBeTruthy();

    mockedSettings = {
      ...oldSettings,
      fileCountMax: 1,
    };

    wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Make sure file limit alert is displayed if over the limit
    expect(wrapper.exists('div#fileLimitAlert')).toBeTruthy();

    mockedSettings = oldSettings;
  });
});
