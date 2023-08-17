import {
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory, MemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockCartItems, mockedSettings } from '../testData';
import {
  checkUser,
  getCartUsers,
  isCartMintable,
  mintCart,
} from '../downloadApi';
import DOIGenerationForm from './DOIGenerationForm.component';

setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    fetchDownloadCart: jest.fn(),
    readSciGatewayToken: jest.fn(() => ({
      username: '1',
    })),
  };
});

jest.mock('../downloadApi', () => {
  const originalModule = jest.requireActual('../downloadApi');

  return {
    ...originalModule,
    isCartMintable: jest.fn(),
    getCartUsers: jest.fn(),
    checkUser: jest.fn(),
    mintCart: jest.fn(),
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

const renderComponent = (
  history = createMemoryHistory({
    initialEntries: [{ pathname: '/download/mint', state: { fromCart: true } }],
  })
): RenderResult & { history: MemoryHistory } => ({
  history,
  ...render(
    <QueryClientProvider client={createTestQueryClient()}>
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <Router history={history}>
          <DOIGenerationForm />
        </Router>
      </DownloadSettingsContext.Provider>
    </QueryClientProvider>
  ),
});

describe('DOI generation form component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();

    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockResolvedValue(mockCartItems);

    (
      isCartMintable as jest.MockedFunction<typeof isCartMintable>
    ).mockResolvedValue(true);

    // mock mint cart error to test dialog can be closed after it errors
    (mintCart as jest.MockedFunction<typeof mintCart>).mockRejectedValue(
      'error'
    );

    (
      getCartUsers as jest.MockedFunction<typeof getCartUsers>
    ).mockResolvedValue([
      {
        id: 1,
        name: '1',
        fullName: 'User 1',
        email: 'user1@example.com',
        affiliation: 'Example Uni',
      },
      {
        id: 2,
        name: '2',
        fullName: 'User 2',
        email: 'user2@example.com',
        affiliation: 'Example 2 Uni',
      },
    ]);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockResolvedValue({
      id: 3,
      name: '3',
      fullName: 'User 3',
      email: 'user3@example.com',
      affiliation: 'Example 3 Uni',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect back to /download if user directly accesses the url', async () => {
    const { history } = renderComponent(createMemoryHistory());

    expect(history.location).toMatchObject({ pathname: '/download' });
  });

  it('should render the data policy before loading the form', async () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('DOIGenerationForm.page_header')
    ).not.toBeInTheDocument();
  });

  it('should let the user fill in the required fields and submit a mint request', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      't'
    );

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      'd'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'downloadConfirmDialog.close_arialabel',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    );
  });

  it('should let the user delete users (but not delete the logged in user)', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'user2@example.com' })
    ).toBeInTheDocument();

    const userDeleteButtons = screen.getAllByRole('button', {
      name: 'DOIGenerationForm.delete_creator',
    });
    expect(userDeleteButtons[0]).toBeDisabled();

    await user.click(userDeleteButtons[1]);

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1)
    ).toHaveLength(1);
    expect(
      screen.getByRole('cell', { name: 'Example Uni' })
    ).toBeInTheDocument();
  });

  it('should let the user add creators (but not duplicate users or if checkUser fails)', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'User 3' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'Creator' }).length).toBe(3);

    // test errors on duplicate user
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByText('Cannot add duplicate user')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' })
    ).toHaveValue('');

    // test errors with various API error responses
    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValueOnce({
      response: { data: { detail: 'error msg' }, status: 404 },
    });

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '4'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('error msg')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValue({
      response: { data: { detail: [{ msg: 'error msg 2' }] }, status: 404 },
    });
    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('error msg 2')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValueOnce({
      response: { status: 422 },
    });
    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
  });

  it('should let the user add contributors & select their contributor type', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_contributor' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'User 3' })).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /DOIGenerationForm.creator_type/i,
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /DOIGenerationForm.creator_type/i,
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'DataCollector' })
    );

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('DataCollector')).toBeInTheDocument();

    // check users and their contributor types get passed correctly to API
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      't'
    );

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      'd'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(mintCart).toHaveBeenCalledWith(
      mockCartItems,
      {
        title: 't',
        description: 'd',
        creators: [
          { username: '2', contributor_type: 'Creator' },
          { username: '3', contributor_type: 'DataCollector' },
        ],
      },
      expect.any(Object)
    );
  });

  it('should let the user change cart tabs', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    expect(
      within(
        screen.getByRole('table', { name: 'cart investigation table' })
      ).getByRole('cell', { name: 'INVESTIGATION 1' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('tab', { name: 'DOIGenerationForm.cart_tab_datasets' })
    );

    expect(
      within(
        screen.getByRole('table', { name: 'cart dataset table' })
      ).getByRole('cell', { name: 'DATASET 1' })
    ).toBeInTheDocument();
  });

  describe('only displays cart tabs if the corresponding entity type exists in the cart: ', () => {
    it('investigations', async () => {
      (
        fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
      ).mockResolvedValue([mockCartItems[0]]);

      renderComponent();

      // accept data policy
      await user.click(
        screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
      );

      expect(
        within(
          screen.getByRole('table', { name: 'cart investigation table' })
        ).getByRole('cell', { name: 'INVESTIGATION 1' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_investigations',
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_datasets',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_datafiles',
        })
      ).not.toBeInTheDocument();
    });

    it('datasets', async () => {
      (
        fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
      ).mockResolvedValue([mockCartItems[2]]);

      renderComponent();

      // accept data policy
      await user.click(
        screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
      );

      expect(
        within(
          screen.getByRole('table', { name: 'cart dataset table' })
        ).getByRole('cell', { name: 'DATASET 1' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_investigations',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'DOIGenerationForm.cart_tab_datasets' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_datafiles',
        })
      ).not.toBeInTheDocument();
    });

    it('datafiles', async () => {
      (
        fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
      ).mockResolvedValue([mockCartItems[3]]);

      renderComponent();

      // accept data policy
      await user.click(
        screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
      );

      expect(
        within(
          screen.getByRole('table', { name: 'cart datafile table' })
        ).getByRole('cell', { name: 'DATAFILE 1' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_investigations',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_datasets',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('tab', {
          name: 'DOIGenerationForm.cart_tab_datafiles',
        })
      ).toBeInTheDocument();
    });
  });
});
