import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RenderResult,
  act,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  DOIIdentifierType,
  DOIRelationType,
  DOIResourceType,
  DataCiteDOI,
  User,
  fetchDownloadCart,
} from 'datagateway-common';
import { MemoryHistory, createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  deleteDraftDOI,
  getCartUsers,
  mintDraftCart,
  publishDraftDOI,
} from '../downloadApi';
import { flushPromises } from '../setupTests';
import { mockCartItems, mockedSettings } from '../testData';
import DOIGenerationForm from './DOIGenerationForm.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    fetchDownloadCart: vi.fn(),
  };
});

vi.mock('../downloadApi', async () => {
  const originalModule = await vi.importActual('../downloadApi');

  return {
    ...originalModule,
    getCartUsers: vi.fn(),
    mintDraftCart: vi.fn(),
    publishDraftDOI: vi.fn(),
    deleteDraftDOI: vi.fn(),
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
      error: vi.fn(),
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

  let mockUser: User;
  let mockDOIResponse: { data: DataCiteDOI };
  let mockDraftResponse: Awaited<ReturnType<typeof mintDraftCart>>;

  beforeEach(() => {
    user = userEvent.setup();

    mockUser = {
      id: 2,
      name: '2',
      fullName: 'User 2',
      email: 'user2@example.com',
      affiliation: 'Example 2 Uni',
    };
    mockDOIResponse = {
      data: {
        id: '1',
        type: 'DOI',
        attributes: {
          doi: 'related.doi.1',
          titles: [{ title: 'Related DOI 1' }],
          url: 'www.example.com',
          // minimum data to not error
          descriptions: [],
          creators: [],
          contributors: [],
          relatedIdentifiers: [],
          publisher: {
            name: 'test',
            publisherIdentifier: null,
            publisherIdentifierScheme: null,
            schemeUri: null,
          },
          publicationYear: 2025,
          dates: [],
          types: {
            resourceType: 'Experimental Datasets',
            resourceTypeGeneral: 'Other',
          },
          rightsList: [],
          geoLocations: [],
          fundingReferences: [],
          subjects: [],
          sizes: [],
          identifiers: [],
          alternateIdentifiers: [],
          language: null,
          formats: [],
          relatedItems: [],
          version: '1',
        },
        relationships: [],
      },
    };
    mockDraftResponse = {
      concept: {
        data_publication_id: '1',
        attributes: {
          doi: 'pid',
          // minimum data to not error
          titles: [],
          descriptions: [],
          creators: [],
          contributors: [],
          relatedIdentifiers: [],
          publisher: {
            name: 'test',
            publisherIdentifier: null,
            publisherIdentifierScheme: null,
            schemeUri: null,
          },
          publicationYear: 2025,
          dates: [],
          types: {
            resourceType: 'Experimental Datasets',
            resourceTypeGeneral: 'Other',
          },
          rightsList: [],
          geoLocations: [],
          fundingReferences: [],
          subjects: [],
          sizes: [],
          url: 'https://example.com',
          identifiers: [],
          alternateIdentifiers: [],
          language: null,
          formats: [],
          relatedItems: [],
          version: '1',
        },
      },
    };

    vi.mocked(fetchDownloadCart).mockResolvedValue(mockCartItems);

    vi.mocked(mintDraftCart).mockResolvedValue(mockDraftResponse);

    // mock publish draft error to test dialog can be closed after it errors
    vi.mocked(publishDraftDOI).mockRejectedValue('error');

    vi.mocked(deleteDraftDOI).mockResolvedValue();

    vi.mocked(getCartUsers).mockResolvedValue([
      {
        id: 1,
        name: '1',
        fullName: 'User 1',
        email: 'user1@example.com',
        affiliation: 'Example Uni',
      },
    ]);

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/user\/.*/.test(url)) {
          return Promise.resolve({
            data: mockUser,
          });
        } else if (/\/dois\/.*/.test(url)) {
          return Promise.resolve({
            data: mockDOIResponse,
          });
        } else if (/\/search.*/.test(url)) {
          return Promise.resolve({
            data: {
              collection: [
                {
                  '@id': 'http://purl.org/pan-science/PaNET/1',
                  prefLabel: `technique1`,
                  synonym: ['1'],
                  links: {
                    descendants: `https://example.com/1/descendants`,
                  },
                },
              ],
            },
          });
        } else if (/\/descendants/.test(url)) {
          return Promise.resolve({
            data: {
              collection: [
                {
                  '@id': 'http://purl.org/pan-science/PaNET/2',
                  prefLabel: `technique2`,
                  synonym: ['2'],
                  links: {
                    descendants: `https://example.com/2/descendants`,
                  },
                },
              ],
            },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    axios.post = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/ismintable$/.test(url)) {
          return Promise.resolve({ status: 200 });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject{enter}'
    );

    // technique selector

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    );

    // expect confirmation page to appear, confirm submission

    await screen.findByText('DOIGenerationForm.review_metadata');

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
        name: 'DOIConfirmDialog.close_aria_label',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    );
  }, 60_000);

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
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_contributor',
      })
    );

    // missing contributor type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.creator_type',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'DataCollector' })
    );

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.related_identifier',
      }),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_related_doi',
      })
    );

    // missing relationship type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_relationship',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: DOIRelationType.IsCitedBy })
    );

    // missing resource type
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_resource_type',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: DOIResourceType.Journal })
    );

    // missing technique
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    // missing subject
    expect(
      // use findBy here as we need to wait for technique dialog to disappear
      await screen.findByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    ).toBeDisabled();

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      's{enter}'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    // expect confirmation page to appear, confirm submission

    await screen.findByText('DOIGenerationForm.review_metadata');

    expect(mintDraftCart).toHaveBeenCalledWith(
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
            identifier: 'related.doi.1',
            relatedIdentifierType: DOIIdentifierType.DOI,
            relationType: DOIRelationType.IsCitedBy,
            relatedItemType: DOIResourceType.Journal,
          },
        ],
        subjects: [
          {
            subject: 's',
            schemeUri: null,
            valueUri: null,
            subjectScheme: null,
            classificationCode: null,
          },
          {
            subject: 'technique1',
            schemeUri: 'http://purl.org/pan-science/PaNET/',
            valueUri: 'http://purl.org/pan-science/PaNET/1',
            subjectScheme:
              'Photon and Neutron Experimental Techniques (PaNET) ontology',
            classificationCode: null,
          },
        ],
      },
      expect.any(Object)
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(publishDraftDOI).toHaveBeenCalledWith('1', expect.anything());
  }, 60_000);

  it('should let the user go back from the confirmation page', async () => {
    renderComponent();

    // accept data policy
    await user.click(
      screen.getByRole('button', { name: 'acceptDataPolicy.accept' })
    );

    expect(
      await screen.findByText('DOIGenerationForm.page_header')
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      't'
    );

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      'd'
    );

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject{enter}'
    );

    // technique selector

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await user.click(
      // use findBy to wait for technique dialog to disappear
      await screen.findByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    );

    // expect confirmation page to appear, confirm submission

    await screen.findByText('DOIGenerationForm.review_metadata');
    expect(
      screen.queryByText('DOIGenerationForm.page_header')
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.back_button' })
    );

    expect(
      await screen.findByText('DOIGenerationForm.page_header')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('DOIGenerationForm.review_metadata')
    ).not.toBeInTheDocument();
    expect(deleteDraftDOI).toHaveBeenCalledWith('1', expect.anything());
  }, 60_000);

  it('should not let the user submit a mint request if cart fails to load', async () => {
    vi.mocked(fetchDownloadCart).mockRejectedValue({ message: 'error' });
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

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject{enter}'
    );

    // technique selector

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.technique_dialog_title',
      })
    );

    // missing cart
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  }, 60_000);

  it('should not let the user submit a mint request if cart is empty', async () => {
    vi.mocked(fetchDownloadCart).mockResolvedValue([]);
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

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject{enter}'
    );

    // technique selector

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.technique_dialog_title',
      })
    );

    // empty cart
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  }, 60_000);

  it('should not let the user submit a mint request if no users selected', async () => {
    vi.mocked(getCartUsers).mockResolvedValue([]);
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

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject{enter}'
    );

    // technique selector

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      '1'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      await screen.findByRole('cell', {
        name: 'technique1 (1)',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.technique_dialog_title',
      })
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
  }, 60_000);

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
      vi.mocked(fetchDownloadCart).mockResolvedValue([mockCartItems[0]]);

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
      vi.mocked(fetchDownloadCart).mockResolvedValue([mockCartItems[2]]);

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
      vi.mocked(fetchDownloadCart).mockResolvedValue([mockCartItems[3]]);

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
