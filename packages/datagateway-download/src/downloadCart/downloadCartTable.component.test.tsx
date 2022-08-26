import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockCartItems, mockedSettings } from '../testData';
import {
  getDatafileCount,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
} from '../downloadApi';
import DownloadCartTable from './downloadCartTable.component';

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

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = (): RenderResult =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <Router history={createMemoryHistory()}>
          <DownloadCartTable statusTabRedirect={jest.fn()} />
        </Router>
      </DownloadSettingsContext.Provider>
    </QueryClientProvider>
  );

describe('Download cart table component', () => {
  let holder, queryClient;
  let user: UserEvent;

  const resetDOM = (): void => {
    if (holder) document.body.removeChild(holder);
    holder = document.getElementById('datagateway-download');
    if (holder) document.body.removeChild(holder);
  };

  beforeEach(() => {
    user = userEvent.setup();
    queryClient = new QueryClient();

    //https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockResolvedValue(mockCartItems);
    (
      removeAllDownloadCartItems as jest.MockedFunction<
        typeof removeAllDownloadCartItems
      >
    ).mockResolvedValue(undefined);
    (
      removeFromCart as jest.MockedFunction<typeof removeFromCart>
    ).mockImplementation((entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValue(1);
    (
      getDatafileCount as jest.MockedFunction<typeof getDatafileCount>
    ).mockResolvedValue(7);
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should render no cart message correctly', async () => {
    (fetchDownloadCart as jest.Mock).mockResolvedValue([]);

    renderComponent();

    expect(
      await screen.findByText('No data selected', { exact: false })
    ).toBeTruthy();
  });

  it('should show download sizes for cart items', async () => {
    renderComponent();

    expect(
      await screen.findByText('downloadCart.total_size: 4 B / 1 TB')
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

    renderComponent();

    expect(
      await screen.findByLabelText('downloadCart.calculating')
    ).toBeInTheDocument();
  });

  it('should show total file count of the cart', async () => {
    renderComponent();

    expect(
      await screen.findByText('downloadCart.number_of_files: 22 / 5000')
    ).toBeTruthy();
  });

  it('should load cart confirmation dialog when Download Cart button is clicked', async () => {
    renderComponent();

    await user.click(await screen.findByText('downloadCart.download'));

    expect(
      await screen.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toBeTruthy();
  });

  it('should remove all items from cart when Remove All button is clicked', async () => {
    renderComponent();

    await user.click(await screen.findByText('downloadCart.remove_all'));

    expect(
      await screen.findByText('No data selected', { exact: false })
    ).toBeTruthy();
  });

  it('disables remove all button while request is processing', async () => {
    // use this to manually resolve promise
    let promiseResolve;

    (
      removeAllDownloadCartItems as jest.MockedFunction<
        typeof removeAllDownloadCartItems
      >
    ).mockImplementation(
      () =>
        new Promise((resolve) => {
          promiseResolve = resolve;
        })
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'downloadCart.remove_all' })
    );

    expect(
      await screen.findByRole('button', { name: 'downloadCart.remove_all' })
    ).toBeDisabled();

    promiseResolve();

    expect(
      await screen.findByTestId('no-selections-message')
    ).toBeInTheDocument();
  });

  it('should disable download button when there are empty items in the cart ', async () => {
    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValueOnce(0);
    (
      getDatafileCount as jest.MockedFunction<typeof getDatafileCount>
    ).mockResolvedValueOnce(0);

    renderComponent();

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
    renderComponent();

    await user.click(
      await screen.findByLabelText('downloadCart.remove {name:INVESTIGATION 2}')
    );

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    });
  });

  it('should sort data when headers are clicked', async () => {
    renderComponent();

    const typeSortLabel = await screen.findByRole('button', {
      name: 'downloadCart.type',
    });

    await user.click(typeSortLabel);

    let rows = await screen.findAllByText(
      /(DATAFILE|DATASET|INVESTIGATION) \d/
    );
    // row should be sorted by type asc.
    expect(rows[0]).toHaveTextContent('DATAFILE 1');
    expect(rows[1]).toHaveTextContent('DATASET 1');
    expect(rows[2]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[3]).toHaveTextContent('INVESTIGATION 2');

    await user.click(typeSortLabel);

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by type desc.
    expect(rows[0]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[1]).toHaveTextContent('INVESTIGATION 2');
    expect(rows[2]).toHaveTextContent('DATASET 1');
    expect(rows[3]).toHaveTextContent('DATAFILE 1');

    const nameSortLabel = await screen.findByRole('button', {
      name: 'downloadCart.name',
    });

    await user.click(nameSortLabel);

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by type desc & name asc.
    expect(rows[0]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[1]).toHaveTextContent('INVESTIGATION 2');
    expect(rows[2]).toHaveTextContent('DATASET 1');
    expect(rows[3]).toHaveTextContent('DATAFILE 1');

    await user.click(nameSortLabel);

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by type desc & name desc.
    expect(rows[0]).toHaveTextContent('INVESTIGATION 2');
    expect(rows[1]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[2]).toHaveTextContent('DATASET 1');
    expect(rows[3]).toHaveTextContent('DATAFILE 1');

    await user.click(nameSortLabel);

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by type desc.
    expect(rows[0]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[1]).toHaveTextContent('INVESTIGATION 2');
    expect(rows[2]).toHaveTextContent('DATASET 1');
    expect(rows[3]).toHaveTextContent('DATAFILE 1');
  }, 10000);

  it('should filter data when text fields are typed into', async () => {
    renderComponent();

    // TEST NAME FILTER INPUT

    expect(await screen.findByText('INVESTIGATION 2')).toBeTruthy();

    const nameFilterInput = await screen.findByLabelText(
      'Filter by downloadCart.name'
    );
    await user.type(nameFilterInput, '1');

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    });

    await user.clear(nameFilterInput);

    expect(await screen.findByText('INVESTIGATION 2')).toBeInTheDocument();

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
    renderComponent();

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

  it('does not display error alerts if file/size limits are not set', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DownloadSettingsContext.Provider
          value={{
            ...mockedSettings,
            fileCountMax: undefined,
            totalSizeMax: undefined,
          }}
        >
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

    expect(
      await screen.findByText('downloadCart.total_size: 4 B', { exact: true })
    ).toBeTruthy();
    expect(
      await screen.findByText('downloadCart.number_of_files: 22', {
        exact: true,
      })
    ).toBeTruthy();
  });
});
