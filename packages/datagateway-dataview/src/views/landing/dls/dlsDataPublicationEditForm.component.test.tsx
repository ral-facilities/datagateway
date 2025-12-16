import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RenderResult,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  ContributorType,
  DOIIdentifierType,
  DOIRelationType,
  DOIResourceType,
  DataCiteDOI,
  DataPublication,
  DataPublicationUser,
  DownloadCartItem,
  dGCommonInitialState,
} from 'datagateway-common';
import { History, createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDataPublicationEditForm from './dlsDataPublicationEditForm.component';

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: vi.fn(),
    },
  });

describe('DOI edit form component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let holder: HTMLElement;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={createTestQueryClient()}>
            <DLSDataPublicationEditForm dataPublicationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  let user: ReturnType<typeof userEvent.setup>;

  let initialData: DataPublication;
  let initialDataCiteData: DataCiteDOI;

  const users = [
    {
      id: 1,
      contributorType: ContributorType.Minter,
      fullName: 'John Smith',
      user: {
        id: 1,
        name: 'John1',
      },
      email: 'user1@example.com',
      affiliations: [{ id: 1, name: 'Example Uni' }],
    },
    {
      id: 2,
      contributorType: ContributorType.Creator,
      fullName: 'Jane Smith',
    },
    {
      id: 3,
      contributorType: ContributorType.Editor,
      fullName: 'Jesse Smith',
    },
  ] satisfies DataPublicationUser[];

  const investigationInstrument = [
    {
      id: 1,
      instrument: {
        id: 3,
        name: 'Beamline 1',
      },
    },
  ];

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'doi 1',
    size: 1,
    investigationInstruments: investigationInstrument,
    startDate: '2023-07-20',
    endDate: '2023-07-21',
  };
  let cartItems: DownloadCartItem[];
  let mintabilityResponse: Promise<Partial<AxiosResponse>>;

  beforeEach(() => {
    initialData = {
      id: 1,
      pid: 'doi 1',
      description: 'foo bar',
      title: 'Title',
      users: users,
      content: {
        id: 9,
        dataCollectionInvestigations: [
          {
            id: 8,
            investigation: investigation,
          },
        ],
        dataCollectionDatasets: [
          {
            id: 15,
            dataset: {
              id: 2,
              name: 'ds',
              modTime: '2024-01-01',
              createTime: '2024-01-01',
            },
          },
        ],
        dataCollectionDatafiles: [
          {
            id: 16,
            datafile: {
              id: 3,
              name: 'df',
              modTime: '2024-01-01',
              createTime: '2024-01-01',
            },
          },
        ],
      },
      type: { id: 13, name: 'Dataset' },
      relatedItems: [],
      publicationDate: '2023-07-20',
    };

    initialDataCiteData = {
      id: '1',
      type: 'doi',
      attributes: {
        publisher: {
          name: '',
          publisherIdentifier: null,
          publisherIdentifierScheme: null,
          schemeUri: null,
        },
        publicationYear: 2025,
        dates: [],
        types: {
          resourceType: '',
          resourceTypeGeneral: '',
        },
        rightsList: [],
        geoLocations: [],
        fundingReferences: [],
        url: '',
        identifiers: [],
        creators: [],
        titles: [],
        subjects: [],
        contributors: [],
        language: null,
        alternateIdentifiers: [],
        relatedIdentifiers: [
          {
            relatedIdentifier: 'doi 3',
            relationType: DOIRelationType.IsDocumentedBy,
            resourceTypeGeneral: DOIResourceType.Book,
            relatedIdentifierType: DOIIdentifierType.DOI,
            relatedMetadataScheme: null,
            schemeType: null,
            schemeUri: null,
          },
          {
            relatedIdentifier: 'https://example.com',
            relationType: DOIRelationType.IsSupplementedBy,
            resourceTypeGeneral: DOIResourceType.ComputationalNotebook,
            relatedIdentifierType: DOIIdentifierType.URL,
            relatedMetadataScheme: null,
            schemeType: null,
            schemeUri: null,
          },
          {
            relatedIdentifier: 'doi 4',
            relationType: DOIRelationType.IsVersionOf,
            resourceTypeGeneral: DOIResourceType.Dataset,
            relatedIdentifierType: DOIIdentifierType.DOI,
            relatedMetadataScheme: null,
            schemeType: null,
            schemeUri: null,
          },
        ],
        sizes: [],
        formats: [],
        version: '',
        descriptions: [],
        relatedItems: [],
        doi: '',
      },
      relationships: undefined,
    };

    cartItems = [
      {
        entityId: 4,
        entityType: 'investigation',
        id: 1,
        name: 'cart investigation',
        parentEntities: [],
      },
      {
        entityId: investigation.id,
        entityType: 'investigation',
        id: 2,
        name: investigation.name,
        parentEntities: [],
      },
    ];
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: {
          ...dGCommonInitialState,
          urls: {
            ...dGCommonInitialState.urls,
            doiMinterUrl: 'https://example.com/doi-minter',
            dataCiteUrl: 'https://example.com/datacite',
          },
        },
      })
    );

    history = createMemoryHistory({
      initialEntries: [
        {
          pathname: generatePath(
            paths.landing.dlsDataPublicationLanding + '/edit',
            {
              dataPublicationId: '1',
            }
          ),
          state: { fromEdit: true },
        },
      ],
    });

    user = userEvent.setup();

    mintabilityResponse = Promise.resolve({ status: 200 });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: [initialData],
          });
        } else if (/\/dois/.test(url)) {
          return Promise.resolve({
            data: { data: initialDataCiteData },
          });
        } else if (/.*\/user\/cart\/.*$/.test(url)) {
          return Promise.resolve({
            data: { cartItems },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    axios.post = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/ismintable$/.test(url)) {
          return mintabilityResponse;
        } else if (/\/draft\/.*\/version$/.test(url)) {
          return Promise.resolve({
            data: {
              version: {
                data_publication_id: '2',
                attributes: {
                  doi: 'new.version.pid',
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
                },
              },
            },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    axios.put = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/draft\/.*\/version\/.*\/publish$/.test(url)) {
          return Promise.resolve({
            data: {
              concept: {
                data_publication_id: '1',
                attributes: { doi: initialData.pid },
              },
              version: {
                data_publication_id: '2',
                attributes: { doi: 'new.version.pid' },
              },
            },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    axios.delete = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/draft\/.*\/version\/.*$/.test(url)) {
          return Promise.resolve({ data: undefined });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });
  });

  afterEach(() => {
    document.body.removeChild(holder);
    vi.clearAllMocks();
  });

  it('should redirect back to landing page if user directly accesses the url', async () => {
    history = createMemoryHistory();
    renderComponent();

    expect(history.location).toMatchObject({
      pathname: generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: '1',
      }),
    });
  });

  it('should default fill the form with existing info and let the user change these and submit a mint request', async () => {
    renderComponent();

    // wait for data publication to load
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'DOIGenerationForm.title' })
      ).toHaveValue('Title')
    );
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      '1'
    );

    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' })
    ).toHaveValue('foo bar');
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      '2'
    );

    // editing related DOIs

    expect(
      await screen.findByRole(
        'table',
        {
          name: 'DOIGenerationForm.related_identifiers',
        },
        { timeout: 5_000 }
      )
    ).toBeInTheDocument();

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'doi 3' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'https://example.com' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_relationship',
      })[0]
    );
    await user.click(
      await screen.findByRole('option', { name: DOIRelationType.IsCitedBy })
    );

    await user.click(
      screen.getAllByRole('button', {
        name: 'DOIGenerationForm.delete_related_identifier',
      })[1]
    );
    expect(
      screen.queryByRole('cell', { name: 'https://example.com' })
    ).not.toBeInTheDocument();

    // editing users
    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.creators_and_contributors',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(
      screen.getByRole('cell', { name: 'user1@example.com' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', {
        name: 'DOIGenerationForm.delete_creator',
      })[1]
    );

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.creators_and_contributors',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.creator_type',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: ContributorType.ProjectLeader })
    );

    // submit edited data publication

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining(`/draft/1/version`),
      {
        datafile_ids: [3],
        dataset_ids: [2],
        investigation_ids: [1],
        metadata: {
          title: 'Title1',
          description: 'foo bar2',
          creators: [
            users[0],
            { ...users[2], contributorType: ContributorType.ProjectLeader },
          ].map((user) => ({
            username: user.user?.name ?? user.fullName,
            contributor_type: user.contributorType,
          })),
          related_items: [
            {
              ...initialDataCiteData.attributes.relatedIdentifiers?.[0],
              relationType: DOIRelationType.IsCitedBy,
            },
          ].map((ri) => ({
            identifier: ri.relatedIdentifier,
            relatedIdentifierType: ri.relatedIdentifierType,
            relationType: ri.relationType,
            relatedItemType: ri.resourceTypeGeneral,
          })),
          resource_type: 'Collection',
        },
      },
      expect.any(Object)
    );

    // expect confirmation page to appear, confirm submission

    await screen.findByText('DOIGenerationForm.review_metadata');

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/draft/1/version/2/publish`),
      undefined,
      expect.any(Object)
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'DOIConfirmDialog.view_data_publication',
      })
    ).toHaveAttribute(
      'href',
      generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: '2',
      })
    );
  }, 30_000);

  it('should let the user go back from the confirmation page', async () => {
    renderComponent();

    expect(
      await screen.findByText('DOIGenerationForm.page_header')
    ).toBeInTheDocument();
    // wait for data publication to load
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'DOIGenerationForm.title' })
      ).toHaveValue('Title')
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
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
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining(`/draft/1/version/2`),
      expect.any(Object)
    );
  });

  it('should display the content table with existing content and let the user change these using cart items and submit a mint request', async () => {
    cartItems = [
      ...cartItems,
      {
        entityId: 5,
        entityType: 'investigation',
        id: 3,
        name: 'unmintable cart investigation',
        parentEntities: [],
      },
    ];
    mintabilityResponse = Promise.reject({
      response: {
        status: 403,
        data: {
          detail: '[5]',
        },
      },
    });
    // have to assert here to suppress vitest complaining about the mintabilityResponse promise rejection
    await expect(mintabilityResponse).rejects.toThrow();

    renderComponent();

    // wait for data publication content to load

    expect(
      await screen.findByRole(
        'table',
        {
          name: 'investigation datapublications.edit.content_table_aria_label',
        },
        { timeout: 5_000 }
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('cell', { name: 'Title 1' })
    ).toBeInTheDocument();

    // editing data

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.edit_data_label',
      })
    );

    const chosen = await screen.findByRole('list', {
      name: 'datapublications.edit.chosen',
    });
    const choices = await screen.findByRole('list', {
      name: 'datapublications.edit.choices',
    });

    // expect any items in the cart already in the data pub aren't shown in chosen

    expect(
      await within(choices).queryByRole('listitem', {
        name: investigation.name,
      })
    ).not.toBeInTheDocument();

    // expect unmintable items to be disabled

    await expect(
      async () =>
        await user.click(
          await within(choices).findByRole('checkbox', {
            name: 'unmintable cart investigation',
          })
        )
    ).rejects.toThrow();

    // remove existing item
    await user.click(
      await within(chosen).findByRole('listitem', {
        name: investigation.title,
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.move_left',
      })
    );

    // add item from cart
    await user.click(
      within(choices).getByRole('listitem', {
        name: 'cart investigation',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.move_right',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.done',
      })
    );

    // check unchecked item is still available as an option
    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.edit.edit_data_label',
      })
    );

    expect(
      await within(
        await screen.findByRole('list', {
          name: 'datapublications.edit.choices',
        })
      ).findByRole('listitem', {
        name: investigation.title,
      })
    ).toBeInTheDocument();

    // submit edited data publication

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining(`/draft/1/version`),
      {
        datafile_ids: [3],
        dataset_ids: [2],
        investigation_ids: [4],
        metadata: {
          title: 'Title',
          description: 'foo bar',
          creators: users.map((user) => ({
            username: user.user?.name ?? user.fullName,
            contributor_type: user.contributorType,
          })),
          related_items: initialDataCiteData.attributes.relatedIdentifiers
            ?.filter((i) => i.relationType !== DOIRelationType.IsVersionOf)
            .map((ri) => ({
              identifier: ri.relatedIdentifier,
              relatedIdentifierType: ri.relatedIdentifierType,
              relationType: ri.relationType,
              relatedItemType: ri.resourceTypeGeneral,
            })),
          resource_type: 'Collection',
        },
      },
      expect.any(Object)
    );

    // expect confirmation page to appear, confirm submission

    await screen.findByText('DOIGenerationForm.review_metadata');

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/draft/1/version/2/publish`),
      undefined,
      expect.any(Object)
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'DOIConfirmDialog.view_data_publication',
      })
    ).toHaveAttribute(
      'href',
      generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: '2',
      })
    );
  });
});
