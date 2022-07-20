import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import DownloadCartTable from './downloadCartTable.component';
import { DownloadCartItem, fetchDownloadCart } from 'datagateway-common';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  getDatafileCount,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
} from '../downloadApi';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    fetchDownloadCart: jest.fn(),
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
    removeFromCart: jest.fn(),
  };
});

const mockCartItems: DownloadCartItem[] = [
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

describe('Download cart table component', () => {
  let history, holder, queryClient;
  let user: UserEvent;

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

  const resetDOM = (): void => {
    if (holder) document.body.removeChild(holder);
    holder = document.getElementById('datagateway-download');
    if (holder) document.body.removeChild(holder);
  };

  beforeEach(() => {
    user = userEvent.setup();
    queryClient = new QueryClient();
    history = createMemoryHistory();

    //https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    (fetchDownloadCart as jest.MockedFunction<
      typeof fetchDownloadCart
    >).mockResolvedValue(mockCartItems);
    (removeAllDownloadCartItems as jest.MockedFunction<
      typeof removeAllDownloadCartItems
    >).mockResolvedValue(null);
    (removeFromCart as jest.MockedFunction<
      typeof removeFromCart
    >).mockImplementation((entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValue(1);
    (getDatafileCount as jest.MockedFunction<
      typeof getDatafileCount
    >).mockResolvedValue(7);
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('test', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );
  });

  it('should render no cart message correctly', async () => {
    (fetchDownloadCart as jest.Mock).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('No data selected', { exact: false })
    ).toBeTruthy();
  });

  it('should show download sizes for cart items', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('downloadCart.total_size: 4 B')
    ).toBeTruthy();
  });

  it('should show progress indicator when calculating file count of cart', async () => {
    (getDatafileCount as jest.Mock).mockImplementation(
      () =>
        new Promise((_) => {
          // never resolve promise so that progress indicator stays visible.
        })
    );

    jest.useFakeTimers();

    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    expect(
      await screen.findByLabelText('downloadCart.calculating')
    ).toBeInTheDocument();
  });

  it('should show total file count of the cart', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('downloadCart.number_of_files: 22')
    ).toBeTruthy();
  });

  it('should load cart confirmation dialog when Download Cart button is clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    await user.click(await screen.findByText('downloadCart.download'));

    expect(
      await screen.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toBeTruthy();
  });

  it('should remove all items from cart when Remove All button is clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    await user.click(await screen.findByText('downloadCart.remove_all'));

    expect(
      await screen.findByText('No data selected', { exact: false })
    ).toBeTruthy();
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

  it('should disable download button when there are empty items in the cart ', async () => {
    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValueOnce(0);
    (getDatafileCount as jest.MockedFunction<
      typeof getDatafileCount
    >).mockResolvedValueOnce(0);

    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText('downloadCart.empty_items_error')
    ).toBeTruthy();

    const downloadButton = await screen.findByText('downloadCart.download');
    // cannot use user.click here because clicking disabled button will throw
    fireEvent.click(downloadButton);
    // should not show confirm dialog
    expect(
      screen.queryByText('downloadConfirmDialog.dialog_arialabel')
    ).toBeNull();
  });

  it("should remove an item when said item's remove button is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    await user.click(
      await screen.findByLabelText('downloadCart.remove {name:INVESTIGATION 2}')
    );

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    });
  });

  it('should sort data when headers are clicked', async () => {
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
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </QueryClientProvider>
    );

    // TEST NAME FILTER INPUT

    expect(await screen.findByText('INVESTIGATION 2')).toBeTruthy();

    const nameFilterInput = await screen.findByLabelText(
      'Filter by downloadCart.name'
    );
    await user.type(nameFilterInput, '1');

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    });

    // TEST TYPE FILTER INPUT

    expect(await screen.findByText('dataset')).toBeTruthy();
    expect(await screen.findByText('datafile')).toBeTruthy();

    const typeFilterInput = await screen.findByLabelText(
      'Filter by downloadCart.type'
    );
    await user.type(typeFilterInput, 'investigation');

    await waitFor(async () => {
      expect(screen.queryByText('dataset')).toBeNull();
      expect(screen.queryByText('datafile')).toBeNull();
    });
  });

  it('should display error alert if file/size limit exceeded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <Router history={createMemoryHistory()}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </Router>
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.queryByText('downloadCart.file_limit_error', { exact: false })
      ).toBeNull();
      expect(
        screen.queryByText('downloadCart.size_limit_error', { exact: false })
      ).toBeNull();
    });

    resetDOM();
    render(
      <QueryClientProvider client={queryClient}>
        <DownloadSettingsContext.Provider
          value={{
            ...mockedSettings,
            totalSizeMax: 1,
          }}
        >
          <Router history={createMemoryHistory()}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </Router>
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText(
        'downloadCart.size_limit_error {totalSizeMax:1 B}',
        { exact: false }
      )
    ).toBeTruthy();

    resetDOM();
    render(
      <QueryClientProvider client={queryClient}>
        <DownloadSettingsContext.Provider
          value={{
            ...mockedSettings,
            fileCountMax: 1,
          }}
        >
          <Router history={createMemoryHistory()}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </Router>
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText(
        'downloadCart.file_limit_error {fileCountMax:1}',
        { exact: false }
      )
    ).toBeTruthy();
  });
});
