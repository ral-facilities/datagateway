import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import axios, { AxiosResponse } from 'axios';
import {
  ContributorType,
  DOIIdentifierType,
  DOIRelationType,
  DOIResourceType,
  DataCiteDOI,
  DataPublication,
  DataPublicationUser,
  dGCommonInitialState,
  readSciGatewayToken,
} from 'datagateway-common';
import { History, createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDataPublicationLanding from './dlsDataPublicationLanding.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: vi.fn(),
  };
});

describe('DLS Data Publication Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSDataPublicationLanding dataPublicationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  const users: DataPublicationUser[] = [
    {
      id: 1,
      contributorType: ContributorType.Minter,
      fullName: 'John Smith',
      user: {
        id: 1,
        name: 'John1',
        orcidId: '123456',
      },
      affiliations: [
        { id: 1, name: 'ABC Uni' },
        { id: 2, name: 'XYZ Org' },
      ],
    },
    {
      id: 2,
      contributorType: 'Experimenter',
      fullName: 'Jane Smith',
    },
    {
      id: 3,
      contributorType: 'Experimenter',
      fullName: 'Jesse Smith',
    },
    {
      id: 4,
      contributorType: 'Experimenter',
      fullName: '',
    },
  ];

  const investigationInstrument = [
    {
      id: 1,
      instrument: {
        id: 3,
        name: 'Beamline 1',
      },
    },
  ];

  const investigationUsers = [{ id: 1, user: users[0].user, role: 'PI' }];

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'doi 1',
    size: 1,
    investigationInstruments: investigationInstrument,
    investigationUsers,
    startDate: '2023-07-20',
    endDate: '2023-07-21',
  };

  let initialData: DataPublication;
  let initialDataCiteData: DataCiteDOI;

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
      },
      type: { id: 13, name: 'User-defined' },
      relatedItems: [
        {
          id: 10,
          identifier: 'doi 2',
          relationType: DOIRelationType.HasVersion,
          createTime: '2024-01-03 12:00:00',
        },
        {
          id: 11,
          identifier: 'doi 3',
          relationType: DOIRelationType.IsSupplementedBy,
          createTime: '2024-01-02 12:00:00',
        },
        {
          id: 13,
          identifier: 'doi 5',
          relationType: DOIRelationType.HasVersion,
          createTime: '2024-01-04 12:00:00',
        },
        {
          id: 12,
          identifier: 'doi 4',
          relationType: DOIRelationType.HasVersion,
          createTime: '2024-01-03 12:00:00',
        },
      ],
      publicationDate: '2023-07-20',
      dates: [
        { id: 1, date: '2025-12-08', dateType: 'Issued' },
        { id: 2, date: '2024-11-19', dateType: 'Collected' },
      ],
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
        dates: [
          { date: '2025-12-08', dateType: 'Issued', dateInformation: null },
          { date: '2024-11-19', dateType: 'Collected', dateInformation: null },
        ],
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
            relatedIdentifier: 'non-url',
            relationType: DOIRelationType.IsSupplementedBy,
            resourceTypeGeneral: DOIResourceType.ComputationalNotebook,
            relatedIdentifierType: DOIIdentifierType.PURL,
            relatedMetadataScheme: null,
            schemeType: null,
            schemeUri: null,
          },
          {
            relatedIdentifier: 'https://example.com/part',
            relationType: DOIRelationType.HasPart,
            resourceTypeGeneral: DOIResourceType.Dataset,
            relatedIdentifierType: DOIIdentifierType.URL,
            relatedMetadataScheme: null,
            schemeType: null,
            schemeUri: null,
          },
          {
            relatedIdentifier: 'doi 4',
            relationType: DOIRelationType.HasVersion,
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

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: { ...dGCommonInitialState, accessMethods: {} },
      })
    );

    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.landing.dlsDataPublicationLanding, {
          dataPublicationId: '1',
        }),
      ],
    });
    user = userEvent.setup();

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: [initialData],
          });
        } else if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: [],
          });
        } else if (/\/count$/.test(url)) {
          return Promise.resolve({
            data: 0,
          });
        } else if (/\/dois/.test(url)) {
          return Promise.resolve({
            data: { data: initialDataCiteData },
          });
        } else if (/\/queue\/allowed$/.test(url)) {
          return Promise.resolve({
            data: true,
          });
        } else if (/.*\/downloadType\/status$/.test(url)) {
          return Promise.resolve({
            data: {
              https: {
                idsUrl: 'https://example.com/ids',
                disabled: false,
                message: '',
                displayName: 'HTTPS',
                description: '',
              },
            },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    vi.mocked(readSciGatewayToken).mockReturnValue({
      sessionId: 'abcdef',
      username: 'John1',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    // displays doi + link correctly
    expect(
      await screen.findByText('datapublications.concept datapublications.pid')
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');

    expect(
      screen.getByText('datapublications.latest_version datapublications.pid')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'DOI doi 5' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 5'
    );

    expect(screen.getByText('2023-07-20')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.publisher.name')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'doi_constants.license.name' })
    ).toHaveAttribute('href', 'doi_constants.license.url');
    expect(screen.getByText('User-defined')).toBeInTheDocument();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith(ABC Uni, XYZ Org)');
    expect(
      within(screen.getByTestId('landing-dataPublication-user-0')).getByTestId(
        'landing-dataPublication-orcidId-link'
      )
    ).toHaveAttribute('href', 'https://orcid.org/123456');
    expect(
      await screen.findByTestId('landing-dataPublication-user-1')
    ).toHaveTextContent('Experimenter: Jane Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-2')
    ).toHaveTextContent('Experimenter: Jesse Smith');

    // two citation formatters
    expect(
      screen.getByText(
        'datapublications.latest_version datapublications.details.citation_formatter.label'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'datapublications.concept datapublications.details.citation_formatter.label'
      )
    ).toBeInTheDocument();
  });

  it('renders correctly if info is missing', async () => {
    initialData.description = undefined;
    initialData.users = undefined;
    initialData.publicationDate = undefined;
    initialData.type = undefined;
    renderComponent();

    // displays doi + link correctly
    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');

    expect(screen.getByText('Description not provided')).toBeInTheDocument();

    expect(screen.queryByText('datapublications.details.users')).toBeNull();
  });

  it('renders correctly whilst loading', async () => {
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByText('doi_constants.publisher.name')
    ).not.toBeInTheDocument();
  });

  it('renders edit button if the user is minter & clicking it takes you to the edit page', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.edit.edit_label',
      })
    );

    expect(history.location).toMatchObject({
      pathname: `${generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: '1',
      })}/edit`,
      state: { fromEdit: true },
    });
  });

  it('renders download button & clicking it opens download dialogue', async () => {
    renderComponent();

    // need to wait for fetching of /queue/allowed
    await waitFor(
      () =>
        expect(
          screen.getByRole('button', {
            name: 'buttons.queue_data_collection',
          })
        ).not.toBeDisabled(),
      { timeout: 5_000 }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'buttons.queue_data_collection',
      })
    );

    await screen.findByRole('dialog', {
      name: 'downloadConfirmDialog.dialog_title',
    });
  });

  it('renders version panel when showing a concept DOI & does not show edit button if user is not the minter', async () => {
    vi.mocked(readSciGatewayToken).mockReturnValueOnce({
      sessionId: 'abcdef',
      username: 'Jane2',
    });
    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'datapublications.edit.edit_label' })
    ).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.details.version_panel_label',
      })
    );
    const versionPanel = await screen.findByRole('region', {
      name: 'datapublications.details.version_panel_label',
    });
    expect(versionPanel).toBeInTheDocument();

    expect(
      within(versionPanel).getByRole('link', { name: 'DOI doi 2' })
    ).toHaveAttribute('href', 'https://doi.org/doi 2');
    expect(
      within(versionPanel).queryByRole('link', { name: 'DOI doi 3' })
    ).not.toBeInTheDocument();
    expect(
      within(versionPanel).getByRole('link', { name: 'DOI doi 4' })
    ).toHaveAttribute('href', 'https://doi.org/doi 4');
    expect(
      within(versionPanel).getByRole('link', { name: 'DOI doi 5' })
    ).toHaveAttribute('href', 'https://doi.org/doi 5');
  });

  it('renders related identifiers panel', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.details.related_identifiers_panel_label',
      })
    );
    const relatedIdentifiersPanel = await screen.findByRole('region', {
      name: 'datapublications.details.related_identifiers_panel_label',
    });
    expect(relatedIdentifiersPanel).toBeInTheDocument();

    expect(
      within(relatedIdentifiersPanel).getByRole('link', { name: 'DOI doi 3' })
    ).toHaveAttribute('href', 'https://doi.org/doi 3');
    expect(
      within(relatedIdentifiersPanel).queryByRole('link', { name: 'DOI doi 4' })
    ).not.toBeInTheDocument();
    expect(
      within(relatedIdentifiersPanel).getByRole('link', {
        name: 'https://example.com/part',
      })
    ).toHaveAttribute('href', 'https://example.com/part');
    expect(
      within(relatedIdentifiersPanel).getByText('non-url')
    ).toBeInTheDocument();
  });

  it('renders a version DOI correctly & does not show the edit button', async () => {
    initialData.relatedItems = [
      {
        id: 10,
        identifier: 'doi 2',
        relationType: DOIRelationType.IsVersionOf,
        createTime: '2024-01-01 12:00:00',
      },
      {
        id: 11,
        identifier: 'doi 3',
        relationType: DOIRelationType.IsSupplementedBy,
        createTime: '2024-01-02 12:00:00',
      },
    ];
    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');

    expect(
      screen.queryByRole('button', { name: 'datapublications.edit.edit_label' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'datapublications.details.version_panel_label',
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('datapublications.details.citation_formatter.label')
    ).toBeInTheDocument();

    expect(
      screen.getByText('datapublications.concept datapublications.pid')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'DOI doi 2' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 2'
    );
    expect(
      screen.queryByRole('link', { name: 'DOI doi 3' })
    ).not.toBeInTheDocument();
  });

  it('renders a session DOI correctly & shows the publish button when unpublished', async () => {
    initialData.type = { id: 1, name: 'Investigation' };
    initialData.publicationDate = null;
    // check we don't render related identifiers panel if we have none
    initialDataCiteData.attributes.relatedIdentifiers = [];
    initialDataCiteData.attributes.relatedItems = [
      {
        titles: [
          {
            title: 'Instrument 1',
          },
        ],
        relationType: DOIRelationType.IsCollectedBy,
        relatedItemType: DOIResourceType.Instrument,
      },
      {
        titles: [
          {
            title: 'Instrument 2',
          },
        ],
        relationType: DOIRelationType.IsCollectedBy,
        relatedItemType: DOIResourceType.Instrument,
      },
    ];
    renderComponent();

    // info panel contents
    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
    expect(
      await screen.findByText('Instrument 1, Instrument 2')
    ).toBeInTheDocument();
    expect(await screen.findByText(/Issued: 2025-12-08/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Collected: 2024-11-19/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Investigation')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'datapublications.edit.edit_label' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'datapublications.details.version_panel_label',
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'datapublications.details.related_identifiers_panel_label',
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('datapublications.details.citation_formatter.label')
    ).toBeInTheDocument();

    // expect structured data
    expect(document.getElementById('dataPublication-1')).not.toBeNull();
  });

  it('session DOI page does not show publish button when publication date is set ', async () => {
    initialData.type = { id: 1, name: 'Investigation' };
    initialData.publicationDate = '2025-12-15';
    initialDataCiteData.attributes.relatedItems = [
      {
        titles: [
          {
            title: 'Instrument 1',
          },
        ],
        relationType: DOIRelationType.IsCollectedBy,
        relatedItemType: DOIResourceType.Instrument,
      },
    ];
    renderComponent();

    // check page loaded
    expect(await screen.findByText('Instrument 1')).toBeInTheDocument();
    // should load related identifiers panel as it's not empty
    expect(
      screen.getByRole('button', {
        name: 'datapublications.details.related_identifiers_panel_label',
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    ).not.toBeInTheDocument();
  });

  it('displays content table when tab is clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('tab', {
        name: 'datapublications.content_tab_label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'datapublications.content_tab_label',
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('tablist', {
        name: 'datapublications.content_tab_entity_tabs_aria_label',
      })
    ).toBeInTheDocument();
  });

  it('renders structured data correctly for concept DOI', async () => {
    initialData.relatedItems = [
      {
        id: 10,
        identifier: 'doi 1',
        relationType: DOIRelationType.HasPart,
        createTime: '2024-01-01 12:00:00',
      },
      {
        id: 11,
        identifier: 'doi 2',
        relationType: DOIRelationType.IsPartOf,
        createTime: '2024-01-01 12:00:00',
      },
    ];
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toBeInTheDocument();

    expect(document.getElementById('dataPublication-1')).toMatchInlineSnapshot(`
      <script
        id="dataPublication-1"
        type="application/ld+json"
      >
        {"@context":"http://schema.org","@type":"Dataset","@id":"https://doi.org/doi 1","url":"https://doi.org/doi 1","identifier":"doi 1","name":"Title","description":"foo bar","keywords":"doi_constants.keywords","publisher":{"@type":"Organization","url":"doi_constants.publisher.url","name":"doi_constants.publisher.name","logo":"doi_constants.publisher.logo","contactPoint":{"@type":"ContactPoint","contactType":"customer service","email":"doi_constants.publisher.email","url":"doi_constants.publisher.url"}},"creator":[{"@type":"Person","name":"John Smith","sameAs":"https://orcid.org/123456","affiliation":[{"name":"ABC Uni"},{"name":"XYZ Org"}]},{"@type":"Person","name":"Jane Smith"},{"@type":"Person","name":"Jesse Smith"}],"includedInDataCatalog":{"@type":"DataCatalog","url":"doi_constants.content_url"},"license":{"@type":"URL","url":"doi_constants.license.url","name":"doi_constants.license.name"},"isAccessibleForFree":true,"hasPart":["doi 1"],"isPartOf":["doi 2"]}
      </script>
    `);
  });

  it('does not render structured data for version dois', async () => {
    initialData.relatedItems = [
      {
        id: 10,
        identifier: 'doi 2',
        relationType: DOIRelationType.IsVersionOf,
        createTime: '2024-01-01 12:00:00',
      },
    ];

    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toBeInTheDocument();

    expect(document.getElementById('dataPublication-1')).toBeNull();
  });
});
