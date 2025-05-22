import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory, MemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockCartItems, mockDownloadItems, mockedSettings } from '../testData';
import {
  downloadPreparedCart,
  getFileSizeAndCount,
  isCartMintable,
  removeAllDownloadCartItems,
  removeFromCart,
} from '../downloadApi';
import DownloadCartTable from './downloadCartTable.component';
import { createTheme } from '@mui/material';
import axios, { AxiosResponse } from 'axios';

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
    getFileSizeAndCount: jest.fn(),
    getIsTwoLevel: jest.fn().mockResolvedValue(true),
    removeFromCart: jest.fn(),
    isCartMintable: jest.fn(),
    downloadPreparedCart: jest.fn(),
  };
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

const renderComponent = (): RenderResult & { history: MemoryHistory } => {
  const history = createMemoryHistory();
  return {
    history: history,
    ...render(
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <Router history={history}>
            <DownloadCartTable statusTabRedirect={jest.fn()} />
          </Router>
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    ),
  };
};

describe('Download cart table component', () => {
  let holder: HTMLElement | null;
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

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

    (
      getFileSizeAndCount as jest.MockedFunction<typeof getFileSizeAndCount>
    ).mockResolvedValue({ fileSize: 1, fileCount: 7 });
    (
      isCartMintable as jest.MockedFunction<typeof isCartMintable>
    ).mockResolvedValue(true);

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/downloads/.test(url)) {
          return Promise.resolve({
            data: [
              {
                ...mockDownloadItems[0],
                status: 'COMPLETE',
              },
            ],
          });
        }
        if (/.*\/user\/downloadType\/(.*)\/status/.test(url)) {
          return Promise.resolve({
            data: { disabled: false, type: 'https', message: '' },
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    axios.post = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*\/submit/.test(url)) {
          return Promise.resolve({
            data: { downloadId: mockDownloadItems[0].id },
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
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

  it('should show progress indicator when calculating file count & size of cart', async () => {
    (getFileSizeAndCount as jest.Mock).mockImplementation(
      () =>
        new Promise((_) => {
          // never resolve promise so that progress indicator stays visible.
        })
    );

    jest.useFakeTimers();

    renderComponent();

    expect(
      await screen.findAllByLabelText('downloadCart.calculating')
    ).toHaveLength(2);
  });

  it('should show total file count of the cart', async () => {
    renderComponent();

    expect(
      await screen.findByText('downloadCart.number_of_files: 28 / 5000')
    ).toBeTruthy();
  });

  it('should load cart confirmation dialog when Download Cart button is clicked', async () => {
    renderComponent();

    const downloadButton = await screen.findByText('downloadCart.download');
    await waitFor(() => expect(downloadButton).toBeEnabled());

    await user.click(downloadButton);

    expect(
      await screen.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toBeTruthy();
  });

  it('should download immediately on successful download submission if download is already complete', async () => {
    renderComponent();

    await user.click(await screen.findByText('downloadCart.download'));

    await user.click(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.download',
      })
    );

    expect(downloadPreparedCart).toHaveBeenCalledWith(
      mockDownloadItems[0].preparedId,
      mockDownloadItems[0].fileName,
      {
        idsUrl:
          mockedSettings.accessMethods[mockDownloadItems[0].transport].idsUrl,
      }
    );
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
    let promiseResolve = (): void => {
      // no-op
    };

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
    (
      getFileSizeAndCount as jest.MockedFunction<typeof getFileSizeAndCount>
    ).mockResolvedValue({ fileSize: 0, fileCount: 0 });

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
    // use skipHover to avoid triggering sort tooltips which slow the test down
    user = userEvent.setup({ skipHover: true });
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

    await user.keyboard('{Shift>}');
    await user.click(nameSortLabel);
    await user.keyboard('{/Shift}');

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by type desc & name asc.
    expect(rows[0]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[1]).toHaveTextContent('INVESTIGATION 2');
    expect(rows[2]).toHaveTextContent('DATASET 1');
    expect(rows[3]).toHaveTextContent('DATAFILE 1');

    await user.keyboard('{Shift>}');
    await user.click(nameSortLabel);
    await user.keyboard('{/Shift}');

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

    await user.click(nameSortLabel);

    rows = await screen.findAllByText(/(DATAFILE|DATASET|INVESTIGATION) \d/);
    // row should be sorted by name asc.
    expect(rows[0]).toHaveTextContent('DATAFILE 1');
    expect(rows[1]).toHaveTextContent('DATASET 1');
    expect(rows[2]).toHaveTextContent('INVESTIGATION 1');
    expect(rows[3]).toHaveTextContent('INVESTIGATION 2');
  });

  it('should filter data when text fields are typed into', async () => {
    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockResolvedValue([
      ...mockCartItems,
      {
        entityId: 11,
        entityType: 'investigation',
        id: 11,
        name: 'INVESTIGATION 11',
        parentEntities: [],
      },
    ]);

    renderComponent();

    // TEST NAME FILTER INPUT

    expect(await screen.findByText('INVESTIGATION 2')).toBeTruthy();

    const nameFilterInput = await screen.findByLabelText(
      'Filter by downloadCart.name'
    );
    await user.type(nameFilterInput, 'INVESTIGATION 1');

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    });
    expect(screen.getByText('INVESTIGATION 11')).toBeInTheDocument();
    expect(screen.getByText('INVESTIGATION 1')).toBeInTheDocument();

    // test exclude filter

    await user.click(
      within(
        screen.getByRole('columnheader', { name: /downloadCart.name/ })
      ).getByLabelText('include, exclude or exact')
    );

    await user.click(
      within(await screen.findByRole('listbox')).getByText('Exclude')
    );

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 1')).toBeNull();
    });
    expect(screen.queryByText('INVESTIGATION 11')).toBeNull();
    expect(screen.getByText('INVESTIGATION 2')).toBeInTheDocument();

    // test exact filter

    await user.click(
      within(
        screen.getByRole('columnheader', { name: /downloadCart.name/ })
      ).getByLabelText('include, exclude or exact')
    );

    await user.click(
      within(await screen.findByRole('listbox')).getByText('Exact')
    );

    await waitFor(async () => {
      expect(screen.queryByText('INVESTIGATION 11')).toBeNull();
    });
    expect(screen.queryByText('INVESTIGATION 2')).toBeNull();
    expect(screen.getByText('INVESTIGATION 1')).toBeInTheDocument();

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
      await screen.findByText('downloadCart.number_of_files: 28', {
        exact: true,
      })
    ).toBeTruthy();
  });

  it('should go to DOI generation form when Generate DOI button is clicked', async () => {
    const { history } = renderComponent();

    const mintButton = await screen.findByRole('link', {
      name: 'downloadCart.generate_DOI',
    });
    await waitFor(() => expect(mintButton).toBeEnabled());

    await user.click(mintButton);

    expect(history.location).toMatchObject({
      pathname: '/download/mint',
      state: { fromCart: true },
    });
  });

  it('should disable Generate DOI button when mintability is loading', async () => {
    (
      isCartMintable as jest.MockedFunction<typeof isCartMintable>
    ).mockImplementation(
      () =>
        new Promise((_) => {
          // do nothing, simulating pending promise to test loading state
        })
    );
    const { history } = renderComponent();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const generateDOIButton = screen
      .getByRole('link', { name: 'downloadCart.generate_DOI' })
      .closest('span')!;

    await user.hover(generateDOIButton);

    expect(
      await screen.findByText('downloadCart.mintability_loading')
    ).toBeInTheDocument();

    await user.click(generateDOIButton);

    expect(history.location).not.toMatchObject({
      pathname: '/download/mint',
      state: { fromCart: true },
    });
  });

  it('should disable Generate DOI button when cart is not mintable', async () => {
    (
      isCartMintable as jest.MockedFunction<typeof isCartMintable>
    ).mockRejectedValue({
      response: {
        data: { detail: 'Not allowed to mint the following items: [2,4]' },
        status: 403,
      },
    });
    const { history } = renderComponent();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const generateDOIButton = screen
      .getByRole('link', { name: 'downloadCart.generate_DOI' })
      .closest('span')!;

    await user.hover(generateDOIButton);

    expect(
      await screen.findByText('downloadCart.not_mintable')
    ).toBeInTheDocument();

    const tableRows = within(
      screen.getByRole('rowgroup', { name: 'grid' })
    ).getAllByRole('row');
    const muiErrorColor = createTheme().palette.error.main;
    expect(tableRows[1]).toHaveStyle(`background-color: ${muiErrorColor}`);
    expect(tableRows[1]).toHaveStyle(`background-color: ${muiErrorColor}`);
    expect(tableRows[0]).not.toHaveStyle(`background-color: ${muiErrorColor}`);
    expect(tableRows[2]).not.toHaveStyle(`background-color: ${muiErrorColor}`);

    await user.click(generateDOIButton);

    expect(history.location).not.toMatchObject({
      pathname: '/download/mint',
      state: { fromCart: true },
    });

    await user.unhover(generateDOIButton);
    for (const row of tableRows) {
      expect(row).not.toHaveStyle(`background-color: ${muiErrorColor}`);
    }
  });
});
