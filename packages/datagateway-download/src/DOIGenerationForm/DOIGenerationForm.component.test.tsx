import {
  act,
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory, MemoryHistory } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockCartItems, mockedSettings } from '../testData';
import {
  checkUser,
  DOIRelationType,
  DOIResourceType,
  fetchDOI,
  getCartUsers,
  isCartMintable,
  mintCart,
} from '../downloadApi';
import DOIGenerationForm from './DOIGenerationForm.component';
import { flushPromises } from '../setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    fetchDownloadCart: jest.fn(),
  };
});

jest.mock('../downloadApi', () => {
  const originalModule = vi.importActual('../downloadApi');

  return {
    ...originalModule,
    isCartMintable: jest.fn(),
    getCartUsers: jest.fn(),
    checkUser: jest.fn(),
    mintCart: jest.fn(),
    fetchDOI: jest.fn(),
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
    ]);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockResolvedValue({
      id: 2,
      name: '2',
      fullName: 'User 2',
      email: 'user2@example.com',
      affiliation: 'Example 2 Uni',
    });

    (fetchDOI as jest.MockedFunction<typeof fetchDOI>).mockResolvedValue({
      id: '1',
      type: 'DOI',
      attributes: {
        doi: 'related.doi.1',
        titles: [{ title: 'Related DOI 1' }],
        url: 'www.example.com',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect back to /download if user directly accesses the url', async () => {
    const { history } = renderComponent(createMemoryHistory());

    await act(async () => {
      await flushPromises();
    });

    expect(history.location).toMatchObject({ pathname: '/download' });
  });

  it('should render the data policy before loading the form', async () => {
    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'acceptDataPolicy.accept' })
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

  it('should not let the user submit a mint request if required fields are missing but can submit once all are filled in', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    // missing title
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      't'
    );

    // missing description
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      'd'
    );

    // missing cart users

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '2'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_contributor' })
    );

    // missing contributor type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: /DOIGenerationForm.creator_type/i,
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'DataCollector' })
    );

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.related_doi' }),
      '1'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    );

    // missing relationship type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: /DOIGenerationForm.related_doi_relationship/i,
      })
    );
    await user.click(await screen.findByRole('option', { name: 'IsCitedBy' }));

    // missing resource type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: /DOIGenerationForm.related_doi_resource_type/i,
      })
    );
    await user.click(await screen.findByRole('option', { name: 'Journal' }));

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(mintCart).toHaveBeenCalledWith(
      mockCartItems,
      {
        title: 't',
        description: 'd',
        creators: [
          { username: '1', contributor_type: 'Creator' },
          { username: '2', contributor_type: 'DataCollector' },
        ],
        related_items: [
          {
            title: 'Related DOI 1',
            fullReference: '',
            identifier: 'related.doi.1',
            relationType: DOIRelationType.IsCitedBy,
            relatedItemType: DOIResourceType.Journal,
          },
        ],
      },
      expect.any(Object)
    );
  });

  it('should not let the user submit a mint request if cart fails to load', async () => {
    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockRejectedValue({ message: 'error' });
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

    // missing cart
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  });

  it('should not let the user submit a mint request if cart is empty', async () => {
    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockResolvedValue([]);
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

    // empty cart
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  });

  it('should not let the user submit a mint request if no users selected', async () => {
    (
      getCartUsers as jest.MockedFunction<typeof getCartUsers>
    ).mockResolvedValue([]);
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

    // no users
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // expect add user + add contributor buttons to also be disabled
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_contributor' })
    ).toBeDisabled();
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
