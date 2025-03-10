import * as React from 'react';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  DataPublication,
  dGCommonInitialState,
  Investigation,
  useDataPublication,
  useDataPublications,
  useInvestigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { generatePath, Router } from 'react-router-dom';
import {
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import { paths } from '../../../page/pageContainer.component';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: jest.fn(),
    useDataPublication: jest.fn(),
    useDataPublications: jest.fn(),
  };
});

describe('ISIS Investigation Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (dataPublication = false): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationLanding
              investigationId="1"
              dataPublication={dataPublication}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  const investigationUser = [
    {
      id: 1,
      role: 'principal_experimenter',
      user: {
        id: 1,
        name: 'JS',
        fullName: 'John Smith',
      },
    },
    {
      id: 2,
      role: 'local_contact',
      user: {
        id: 2,
        name: 'JS',
        fullName: 'Jane Smith',
      },
    },
    {
      id: 3,
      role: 'experimenter',
      user: {
        id: 3,
        name: 'JS',
        fullName: 'Jesse Smith',
      },
    },
    {
      id: 4,
      role: 'experimenter',
      user: {
        id: 4,
        name: 'JS',
        fullName: '',
      },
    },
  ];
  const sample = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      name: 'Sample',
    },
  ];
  const publication = [
    {
      id: 1,
      fullReference: 'Journal, Author, Date, DOI',
    },
  ];

  let initialInvestigationData: Investigation[] = [];

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

  // dummy data to stop TS from complaining, gets overwritten in beforeEach
  let initialDataPublicationData: DataPublication = {
    id: 1,
    pid: '1',
    title: '1',
  };
  let initialStudyDataPublicationData: DataPublication[] = [];

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.landing.isisInvestigationLanding, {
          instrumentId: '4',
          facilityCycleId: '5',
          investigationId: '1',
        }),
      ],
    });
    user = userEvent.setup();

    initialInvestigationData = [
      {
        id: 1,
        title: 'Test title 1',
        name: 'Test 1',
        fileSize: 1,
        fileCount: 1,
        summary: 'foo bar',
        visitId: 'visit id 1',
        doi: 'doi 1',
        facility: {
          id: 17,
          name: 'LILS',
        },
        investigationInstruments: [
          {
            id: 1,
            instrument: {
              id: 3,
              name: 'LARMOR',
            },
          },
        ],
        dataCollectionInvestigations: [
          {
            id: 1,
            dataCollection: {
              id: 11,
              dataPublications: [
                {
                  id: 7,
                  pid: 'Data Publication Pid',
                  description: 'Data Publication description',

                  title: 'Data Publication',
                  type: { id: 12, name: 'study' },
                },
              ],
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
        datasets: [
          {
            id: 1,
            name: 'dataset 1',
            doi: 'dataset doi',
            modTime: '2019-06-10',
            createTime: '2019-06-10',
          },
        ],
        investigationUsers: investigationUser,
        publications: publication,
        samples: sample,
      },
    ];

    initialStudyDataPublicationData = [
      {
        id: 5,
        pid: '10.1234/ISIS.E.RB123456',
        title: 'Title 1',
        publicationDate: '2019-06-10',
      },
    ];
    initialDataPublicationData = {
      id: 8,
      pid: '10.1234/ISIS.E.RB123456-1',
      title: 'Title 1.1',
      description: 'foo bar',
      publicationDate: '2019-06-10',
      content: {
        id: 10,
        dataCollectionInvestigations: [
          {
            id: 9,
            investigation: initialInvestigationData[0],
          },
        ],
      },
      users,
      facility: {
        id: 17,
        name: 'LILS',
      },
    };

    (useInvestigation as jest.Mock).mockReturnValue({
      data: initialInvestigationData,
    });

    (useDataPublication as jest.Mock).mockReturnValue({
      data: initialDataPublicationData,
    });

    (useDataPublications as jest.Mock).mockReturnValue({
      data: initialStudyDataPublicationData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for facility cycle hierarchy', () => {
    renderComponent();

    // branding should be visible
    expect(screen.getByRole('img', { name: 'STFC Logo' })).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.branding.title')
    ).toBeInTheDocument();
    expect(screen.getByText('doi_constants.branding.body')).toBeInTheDocument();

    // investigation details should be visible
    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();

    // publisher section should be visible
    expect(
      screen.getByText('datapublications.details.publisher')
    ).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.publisher.name')
    ).toBeInTheDocument();

    // investigation samples should displayed correctly
    expect(
      screen.getByText('investigations.details.samples.label')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByLabelText(/landing-investigation-sample-\d+$/)
    ).toHaveLength(1);
    expect(
      screen.getByLabelText('landing-investigation-sample-0')
    ).toHaveTextContent('Sample');

    // publications should be displayed correctly
    expect(
      screen.getByText('investigations.details.publications.label')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByLabelText(/landing-investigation-reference-\d+$/)
    ).toHaveLength(1);
    expect(
      screen.getByLabelText('landing-investigation-reference-0')
    ).toHaveTextContent('Journal, Author, Date, DOI');

    // short format information should be visible
    expect(screen.getByText('investigations.visit_id:')).toBeInTheDocument();
    expect(screen.getByText('visit id 1')).toBeInTheDocument();
    expect(screen.getByText('investigations.doi:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
    expect(screen.getByText('investigations.parent_doi:')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Data Publication Pid' })
    ).toHaveAttribute('href', 'https://doi.org/Data Publication Pid');
    expect(screen.getByText('investigations.name:')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('investigations.size:')).toBeInTheDocument();
    expect(screen.getByText('1 B')).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.facility:')
    ).toBeInTheDocument();
    expect(screen.getByText('LILS')).toBeInTheDocument();
    expect(screen.getByText('investigations.instrument:')).toBeInTheDocument();
    expect(screen.getByText('LARMOR')).toBeInTheDocument();
    expect(
      screen.getByText('datapublications.details.format:')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'doi_constants.distribution.format' })
    ).toHaveAttribute(
      'href',
      'https://www.isis.stfc.ac.uk/Pages/ISIS-Raw-File-Format.aspx'
    );
    expect(screen.queryByText('investigations.release_date:')).toBeNull();
    expect(screen.getByText('investigations.start_date:')).toBeInTheDocument();
    expect(screen.getByText('2019-06-10')).toBeInTheDocument();
    expect(screen.getByText('investigations.end_date:')).toBeInTheDocument();
    expect(screen.getByText('2019-06-11')).toBeInTheDocument();

    const actionButtonContainer = screen.getByTestId(
      'investigation-landing-action-container'
    );

    // actions should be visible
    expect(actionButtonContainer).toBeInTheDocument();
    expect(
      within(actionButtonContainer).getByRole('button', {
        name: 'buttons.add_to_cart',
      })
    ).toBeInTheDocument();
    expect(
      within(actionButtonContainer).getByRole('button', {
        name: 'buttons.download',
      })
    ).toBeInTheDocument();

    // datasets should be visible

    expect(
      screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/1'
    );
    expect(screen.getByText('datasets.doi:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'dataset doi' })).toHaveAttribute(
      'href',
      'https://doi.org/dataset doi'
    );

    // actions for datasets should be visible
    const actionContainer = screen.getByTestId(
      'investigation-landing-dataset-0-action-container'
    );
    expect(actionContainer).toBeInTheDocument();
    expect(
      within(actionContainer).getByRole('button', {
        name: 'buttons.add_to_cart',
      })
    ).toBeInTheDocument();
  });

  it('renders correctly for facility cycle hierarchy when no description, users, samples or publications', async () => {
    initialInvestigationData[0].summary = undefined;
    initialInvestigationData[0].publications = [];
    initialInvestigationData[0].samples = [];
    initialInvestigationData[0].investigationUsers = undefined;

    renderComponent();

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Description not provided')).toBeInTheDocument();

    // no investigation samples, so show no samples message
    expect(
      screen.getByText('investigations.details.samples.no_samples')
    ).toBeInTheDocument();

    // no investigation publications, so show no publications message
    expect(
      screen.getByText('investigations.details.publications.no_publications')
    );

    // no users, so should hide users section
    expect(screen.queryByText('investigations.details.users.label')).toBeNull();
  });

  it('renders correctly for data publication hierarchy', () => {
    history.replace(
      generatePath(paths.dataPublications.landing.isisInvestigationLanding, {
        instrumentId: '4',
        dataPublicationId: '5',
        investigationId: '1',
      })
    );
    renderComponent(true);

    // branding should be visible
    expect(screen.getByRole('img', { name: 'STFC Logo' })).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.branding.title')
    ).toBeInTheDocument();
    expect(screen.getByText('doi_constants.branding.body')).toBeInTheDocument();

    // investigation details should be visible
    expect(screen.getByText('Title 1.1')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();

    // publisher section should be visible
    expect(
      screen.getByText('datapublications.details.publisher')
    ).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.publisher.name')
    ).toBeInTheDocument();

    // investigation samples should be hidden
    expect(
      screen.queryByText('investigations.details.samples.label')
    ).toBeNull();
    expect(
      screen.queryByText('investigations.details.samples.no_samples')
    ).toBeNull();
    expect(
      screen.queryAllByLabelText(/landing-investigation-sample-\d+$/)
    ).toHaveLength(0);

    // publication section should be hidden
    expect(
      screen.queryByText('investigations.details.publications.label')
    ).toBeNull();
    expect(
      screen.queryByText('investigations.details.publications.no_publications')
    ).toBeNull();
    expect(
      screen.queryAllByLabelText(/landing-investigation-reference-\d+$/)
    ).toHaveLength(0);

    // short format information should be visible
    expect(screen.getByText('investigations.visit_id:')).toBeInTheDocument();
    expect(screen.getByText('visit id 1')).toBeInTheDocument();
    expect(screen.getByText('investigations.doi:')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '10.1234/ISIS.E.RB123456-1' })
    ).toHaveAttribute('href', 'https://doi.org/10.1234/ISIS.E.RB123456-1');
    expect(screen.getByText('investigations.parent_doi:')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '10.1234/ISIS.E.RB123456' })
    ).toHaveAttribute('href', 'https://doi.org/10.1234/ISIS.E.RB123456');
    expect(screen.getByText('investigations.name:')).toBeInTheDocument();
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.facility:')
    ).toBeInTheDocument();
    expect(screen.getByText('LILS')).toBeInTheDocument();
    expect(screen.getByText('investigations.instrument:')).toBeInTheDocument();
    expect(screen.getByText('LARMOR')).toBeInTheDocument();
    expect(
      screen.getByText('datapublications.details.format:')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'doi_constants.distribution.format' })
    ).toHaveAttribute(
      'href',
      'https://www.isis.stfc.ac.uk/Pages/ISIS-Raw-File-Format.aspx'
    );
    expect(
      screen.getByText('investigations.release_date:')
    ).toBeInTheDocument();
    expect(screen.getByText('2019-06-10')).toBeInTheDocument();

    const actionButtonContainer = screen.getByTestId(
      'investigation-landing-action-container'
    );

    // actions should be visible
    expect(actionButtonContainer).toBeInTheDocument();
    expect(
      within(actionButtonContainer).getByRole('button', {
        name: 'buttons.add_to_cart',
      })
    ).toBeInTheDocument();
    expect(
      within(actionButtonContainer).getByRole('button', {
        name: 'buttons.download',
      })
    ).toBeInTheDocument();

    // datasets should be visible
    expect(
      screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/1'
    );

    // actions for datasets should be visible
    const actionContainer = screen.getByTestId(
      'investigation-landing-dataset-0-action-container'
    );
    expect(actionContainer).toBeInTheDocument();
    expect(
      within(actionContainer).getByRole('button', {
        name: 'buttons.add_to_cart',
      })
    ).toBeInTheDocument();
  });

  it('renders correctly for data publication hierarchy when no investigations or description', () => {
    initialDataPublicationData.description = undefined;
    if (initialDataPublicationData.content?.dataCollectionInvestigations?.[0])
      initialDataPublicationData.content.dataCollectionInvestigations[0].investigation =
        undefined;

    history.replace(
      generatePath(paths.dataPublications.landing.isisInvestigationLanding, {
        instrumentId: '4',
        dataPublicationId: '5',
        investigationId: '1',
      })
    );
    renderComponent(true);

    expect(screen.getByText('Description not provided')).toBeInTheDocument();

    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'investigations.visit_id:1'
      )
    ).toBeInTheDocument();

    // should not display missing info

    expect(
      screen.queryByText('investigations.instrument')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('tab', { name: 'investigation-datasets-tab' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('investigation-landing-action-container')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText('landing-investigation-part-label')
    ).not.toBeInTheDocument();
  });

  describe('links to the correct url in the datafiles tab', () => {
    it('for facility cycle hierarchy and normal view', async () => {
      renderComponent();

      expect(
        screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/1'
      );

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
      );
    });

    it('for facility cycle hierarchy and cards view', async () => {
      history.replace({ search: '?view=card' });
      renderComponent();

      expect(
        screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/1?view=card'
      );

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
      );
      expect(history.location.search).toBe('?view=card');
    });

    it('for data publication hierarchy and normal view', async () => {
      history.replace(
        generatePath(paths.dataPublications.landing.isisInvestigationLanding, {
          instrumentId: '4',
          dataPublicationId: '5',
          investigationId: '1',
        })
      );
      renderComponent(true);

      expect(
        screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/1'
      );

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset'
      );
    });

    it('for data publication hierarchy and cards view', async () => {
      history.replace({
        pathname: generatePath(
          paths.dataPublications.landing.isisInvestigationLanding,
          {
            instrumentId: '4',
            dataPublicationId: '5',
            investigationId: '1',
          }
        ),
        search: '?view=card',
      });
      renderComponent(true);

      expect(
        screen.getByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/1?view=card'
      );

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset'
      );
      expect(history.location.search).toBe('?view=card');
    });
  });
});
