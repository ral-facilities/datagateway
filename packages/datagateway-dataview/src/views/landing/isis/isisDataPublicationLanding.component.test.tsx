import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  DataPublication,
  dGCommonInitialState,
  useDataPublication,
  useDataPublications,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { generatePath, Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ISISDataPublicationLanding from './isisDataPublicationLanding.component';
import { paths } from '../../../page/pageContainer.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDataPublication: jest.fn(),
    useDataPublications: jest.fn(),
  };
});

describe('ISIS Data Publication Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDataPublicationLanding dataPublicationId="5" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  const users = [
    {
      id: 1,
      contributorType: 'principal_experimenter',
      fullName: 'John Smith',
    },
    {
      id: 2,
      contributorType: 'local_contact',
      fullName: 'Jane Smith',
    },
    {
      id: 3,
      contributorType: 'experimenter',
      fullName: 'Jesse Smith',
    },
    {
      id: 6,
      contributorType: 'experimenter',
      fullName: '',
    },
  ];

  const investigationInstrument = [
    {
      id: 1,
      instrument: {
        id: 4,
        name: 'LARMOR',
      },
    },
    {
      id: 2,
      instrument: {
        id: 5,
        name: 'ALF',
      },
    },
  ];

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'investigation doi 1.1',
    fileSize: 1,
    investigationInstruments: [investigationInstrument[0]],
    startDate: '2019-06-10',
    endDate: '2019-06-11',
    releaseDate: '2019-06-12',
  };

  const investigation2 = {
    id: 2,
    title: 'Title 2',
    name: 'Name 2',
    summary: 'foo bar',
    visitId: '2',
    doi: 'investigation doi 1.2',
    fileSize: 2,
    investigationInstruments: [investigationInstrument[1]],
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  // dummy data to stop TS from complaining, gets overwritten in beforeEach
  let initialStudyDataPublicationData: DataPublication = {
    id: 1,
    pid: '1',
    title: '1',
  };
  let initialInvestigationDataPublicationsData: DataPublication[] = [];

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    history = createMemoryHistory({
      initialEntries: [
        generatePath(
          paths.dataPublications.landing.isisDataPublicationLanding,
          {
            instrumentId: '4',
            dataPublicationId: '5',
          }
        ),
      ],
    });
    user = userEvent.setup();

    initialStudyDataPublicationData = {
      id: 5,
      pid: 'doi 1',
      users: users,
      publicationDate: '2019-06-10',
      title: 'Study title',
    };
    initialInvestigationDataPublicationsData = [
      {
        id: 8,
        pid: 'investigation doi 1.1',
        title: 'Title 1',
        description: 'foo bar',
        content: {
          id: 21,
          dataCollectionInvestigations: [
            {
              id: 19,
              investigation: investigation,
            },
          ],
        },
        publicationDate: '2019-06-11',
      },
      {
        id: 9,
        pid: 'investigation doi 1.2',
        title: 'Title 2',
        content: {
          id: 22,
          dataCollectionInvestigations: [
            {
              id: 20,
              investigation: investigation2,
            },
          ],
        },
      },
    ];

    (useDataPublication as jest.Mock).mockReturnValue({
      data: initialStudyDataPublicationData,
    });

    (useDataPublications as jest.Mock).mockReturnValue({
      data: initialInvestigationDataPublicationsData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('links to the correct url in the datafiles tab', () => {
    it('in normal view', async () => {
      renderComponent();

      await user.click(
        screen.getByRole('tab', {
          name: 'datapublications.details.investigations',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation'
      );
    });

    it('in cards view', async () => {
      history.replace({ search: '?view=card' });
      renderComponent();

      await user.click(
        screen.getByRole('tab', {
          name: 'datapublications.details.investigations',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation'
      );
      expect(history.location.search).toBe('?view=card');
    });
  });

  it('renders correctly', async () => {
    renderComponent();

    // displays doi + link correctly
    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
    expect(
      screen.getByText('datapublications.publication_date:')
    ).toBeInTheDocument();
    expect(screen.getByText('2019-06-10')).toBeInTheDocument();
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();

    // renders users correctly
    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-1')
    ).toHaveTextContent('Local Contact: Jane Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-2')
    ).toHaveTextContent('Experimenter: Jesse Smith');

    // renders parts (investigations) correctly
    expect(
      screen.getByRole('link', { name: 'Part DOI: investigation doi 1.1' })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/4/dataPublication/5/investigation/8'
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === 'investigations.instrument:LARMOR'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === 'investigations.release_date:2019-06-11'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Part DOI: investigation doi 1.2' })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/4/dataPublication/5/investigation/9'
    );
    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'investigations.instrument:ALF'
      )
    ).toBeInTheDocument();

    // actions for investigations should be visible
    expect(
      document.getElementById('add-to-cart-btn-investigation-1')
    ).toBeInTheDocument();
    expect(document.getElementById('download-btn-1')).toBeInTheDocument();
    expect(
      document.getElementById('add-to-cart-btn-investigation-2')
    ).toBeInTheDocument();
    expect(document.getElementById('download-btn-2')).toBeInTheDocument();
  });

  it('renders correctly when info is missing', async () => {
    // missing description
    initialInvestigationDataPublicationsData[0].description = undefined;
    initialStudyDataPublicationData.users = [];
    // missing investigations - i.e. investigations not public yet
    if (
      initialInvestigationDataPublicationsData[0].content
        ?.dataCollectionInvestigations?.[0]
    )
      initialInvestigationDataPublicationsData[0].content.dataCollectionInvestigations[0].investigation =
        undefined;
    if (
      initialInvestigationDataPublicationsData[1].content
        ?.dataCollectionInvestigations?.[0]
    )
      initialInvestigationDataPublicationsData[1].content.dataCollectionInvestigations[0].investigation =
        undefined;

    renderComponent();

    expect(
      await screen.findByText('Description not provided')
    ).toBeInTheDocument();

    expect(screen.queryByText('investigations.details.users.label')).toBeNull();

    // renders parts (investigations) correctly
    expect(
      screen.getByRole('link', { name: 'Part DOI: investigation doi 1.1' })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/4/dataPublication/5/investigation/8'
    );

    expect(
      screen.getByRole('link', { name: 'Part DOI: investigation doi 1.2' })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/4/dataPublication/5/investigation/9'
    );

    // actions for investigations should not be visible
    expect(
      document.getElementById('add-to-cart-btn-investigation-1')
    ).not.toBeInTheDocument();
    expect(document.getElementById('download-btn-1')).not.toBeInTheDocument();
    expect(
      document.getElementById('add-to-cart-btn-investigation-2')
    ).not.toBeInTheDocument();
    expect(document.getElementById('download-btn-2')).not.toBeInTheDocument();
  });

  it('renders structured data correctly', async () => {
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toBeInTheDocument();

    expect(document.getElementById('dataPublication-5')).toMatchInlineSnapshot(`
      <script
        id="dataPublication-5"
        type="application/ld+json"
      >
        {"@context":"http://schema.org","@type":"Dataset","@id":"https://doi.org/doi 1","url":"https://doi.org/doi 1","identifier":"doi 1","name":"Title 1","description":"foo bar","keywords":"doi_constants.keywords","publisher":{"@type":"Organization","url":"doi_constants.publisher.url","name":"doi_constants.publisher.name","logo":"doi_constants.publisher.logo","contactPoint":{"@type":"ContactPoint","contactType":"customer service","email":"doi_constants.publisher.email","url":"doi_constants.publisher.url"}},"creator":[{"@type":"Person","name":"John Smith"},{"@type":"Person","name":"Jane Smith"},{"@type":"Person","name":"Jesse Smith"}],"includedInDataCatalog":{"@type":"DataCatalog","url":"doi_constants.distribution.content_url"},"license":"doi_constants.distribution.license"}
      </script>
    `);
  });
});
