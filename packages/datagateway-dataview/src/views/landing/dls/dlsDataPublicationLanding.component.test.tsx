import * as React from 'react';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  ContributorType,
  DOIRelationType,
  DataPublication,
  dGCommonInitialState,
  readSciGatewayToken,
  useDataPublication,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router, generatePath } from 'react-router-dom';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import DLSDataPublicationLanding from './dlsDataPublicationLanding.component';
import { paths } from '../../../page/pageContainer.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: jest
      .fn()
      .mockReturnValue({ sessionId: 'abcdef', username: 'John1' }),
    useDataPublication: jest.fn(),
    useDataPublicationContentCount: jest.fn(() =>
      // mock to prevent errors when we check we can switch to the content tab
      ({ data: 0 })
    ),
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

  const users = [
    {
      id: 1,
      contributorType: ContributorType.Minter,
      fullName: 'John Smith',
      user: {
        id: 1,
        name: 'John1',
      },
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

  let initialData: DataPublication;

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
      type: { id: 13, name: 'Dataset' },
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
    };

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
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

    (useDataPublication as jest.Mock).mockReturnValue({
      data: initialData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    // displays doi + link correctly
    expect(
      screen.getByText('datapublications.concept datapublications.pid')
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');

    expect(
      screen.getByText('datapublications.latest_version datapublications.pid')
    ).toBeInTheDocument();
    // should be 2 versions of the latest version DOI - one in the latest version label
    // and one in the version panel
    expect(screen.getAllByRole('link', { name: 'DOI doi 5' })).toHaveLength(2);

    expect(screen.getByText('2023-07-20')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.publisher.name')
    ).toBeInTheDocument();
    expect(screen.getByText('Dataset')).toBeInTheDocument();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith');
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

  it('renders version panel when showing a concept DOI & does not show edit button if user is not the minter', async () => {
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      sessionId: 'abcdef',
      username: 'Jane2',
    });
    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'datapublications.edit.edit_label' })
    ).not.toBeInTheDocument();

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

    expect(screen.getByRole('link', { name: 'DOI doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );

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

  it('displays content table when tab is clicked', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('tab', { name: 'datapublications.content_tab_label' })
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
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toBeInTheDocument();

    expect(document.getElementById('dataPublication-1')).toMatchInlineSnapshot(`
      <script
        id="dataPublication-1"
        type="application/ld+json"
      >
        {"@context":"http://schema.org","@type":"Dataset","@id":"https://doi.org/doi 1","url":"https://doi.org/doi 1","identifier":"doi 1","name":"Title","description":"foo bar","keywords":"doi_constants.keywords","publisher":{"@type":"Organization","url":"doi_constants.publisher.url","name":"doi_constants.publisher.name","logo":"doi_constants.publisher.logo","contactPoint":{"@type":"ContactPoint","contactType":"customer service","email":"doi_constants.publisher.email","url":"doi_constants.publisher.url"}},"creator":[{"@type":"Person","name":"John Smith"},{"@type":"Person","name":"Jane Smith"},{"@type":"Person","name":"Jesse Smith"}],"includedInDataCatalog":{"@type":"DataCatalog","url":"doi_constants.distribution.content_url"},"license":"doi_constants.distribution.license"}
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
