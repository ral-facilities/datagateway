import * as React from 'react';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  SuggestedInvestigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

const mockSuggestions: SuggestedInvestigation[] = [
  {
    id: 1,
    visitId: 'visitId',
    name: 'Suggested investigation 1 name',
    title: 'Suggested investigation 1',
    summary: 'Suggested investigation 1 summary',
    doi: 'doi1',
    score: 0.9,
  },
  {
    id: 2,
    visitId: 'visitId',
    name: 'Suggested investigation 2 name',
    title: 'Suggested investigation 2',
    summary: 'Suggested investigation 2 summary',
    doi: 'doi2',
    score: 0.9,
  },
  {
    id: 3,
    visitId: 'visitId',
    name: 'Suggested investigation 3 name',
    title: 'Suggested investigation 3',
    summary: 'Suggested investigation 3 summary',
    doi: 'doi3',
    score: 0.9,
  },
  {
    id: 4,
    visitId: 'visitId',
    name: 'Suggested investigation 4 name',
    title: 'Suggested investigation 4',
    summary: 'Suggested investigation 4 summary',
    doi: 'doi4',
    score: 0.9,
  },
];

describe('ISIS Investigation Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  const renderComponent = (dataPublication = false): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationLanding
              instrumentId="4"
              instrumentChildId="5"
              investigationId="1"
              dataPublication={dataPublication}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  const initialData = [
    {
      id: 1,
      title: 'Test title 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: 'visit id 1',
      doi: 'doi 1',
      size: 1,
      facility: {
        name: 'LILS',
      },
      investigationInstruments: [
        {
          id: 1,
          instrument: {
            id: 3,
            name: 'LARMOR',
          },
          investigation: {
            id: 1,
          },
        },
      ],
      dataCollectionInvestigations: [
        {
          id: 1,
          investigation: {
            id: 1,
            title: 'Test title 1',
            name: 'Test 1',
            visitId: 'visit id 1',
          },
          dataCollection: {
            id: 11,
            dataPublications: [
              {
                id: 7,
                pid: 'Data Publication Pid',
                description: 'Data Publication description',
                modTime: '2019-06-10',
                createTime: '2019-06-11',
                title: 'Data Publication',
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
        },
      ],
    },
  ];
  const investigationUser = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      role: 'principal_experimenter',
      user: {
        id: 1,
        name: 'JS',
        fullName: 'John Smith',
      },
    },
    {
      id: 2,
      investigation: {
        id: 1,
      },
      role: 'local_contact',
      user: {
        id: 2,
        name: 'JS',
        fullName: 'Jane Smith',
      },
    },
    {
      id: 3,
      investigation: {
        id: 1,
      },
      role: 'experimenter',
      user: {
        id: 3,
        name: 'JS',
        fullName: 'Jesse Smith',
      },
    },
    {
      id: 4,
      investigation: {
        id: 1,
      },
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
  const noSamples: never[] = [];
  const noPublication: never[] = [];

  const mockAxiosGet = (
    url: string
  ): Promise<Partial<AxiosResponse>> | undefined => {
    if (url.includes('/investigations')) {
      return Promise.resolve({
        data: initialData,
      });
    }

    if (url.includes('/user/getSize')) {
      return Promise.resolve({ data: 1 });
    }

    if (url.includes('/similar')) {
      return Promise.resolve({
        data: mockSuggestions,
      });
    }
  };

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    history = createMemoryHistory();
    user = userEvent.setup();

    axios.get = jest.fn().mockImplementation(mockAxiosGet);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders landing for investigation correctly', async () => {
    renderComponent();

    // branding should be visible
    expect(screen.getByRole('img', { name: 'STFC Logo' })).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.branding.title')
    ).toBeInTheDocument();
    expect(screen.getByText('doi_constants.branding.body')).toBeInTheDocument();

    // investigation details should be visible
    expect(await screen.findByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('foo bar')).toBeInTheDocument();

    // publisher section should be visible
    expect(
      screen.getByText('datapublications.details.publisher')
    ).toBeInTheDocument();
    expect(
      screen.getByText('doi_constants.publisher.name')
    ).toBeInTheDocument();

    // investigation samples should be hidden (initial data does not have samples)
    expect(
      screen.queryByText('investigations.details.samples.label')
    ).toBeNull();
    expect(
      screen.queryByText('investigations.details.samples.no_samples')
    ).toBeNull();
    expect(
      screen.queryAllByLabelText(/landing-investigation-sample-\d+$/)
    ).toHaveLength(0);

    // publication section should be hidden (initial data does not have publications)
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

    await user.click(
      screen.getByRole('button', {
        name: 'investigations.landingPage.similarInvestigations',
      })
    );

    expect(
      await screen.findByRole('link', {
        name: 'Suggested investigation 1',
      })
    ).toHaveAttribute('href', 'https://doi.org/doi1');
    expect(
      await screen.findByRole('link', {
        name: 'Suggested investigation 2',
      })
    ).toHaveAttribute('href', 'https://doi.org/doi2');
    expect(
      await screen.findByRole('link', {
        name: 'Suggested investigation 3',
      })
    ).toHaveAttribute('href', 'https://doi.org/doi3');
  });

  describe('renders datasets for the investigation correctly', () => {
    it('for facility cycle hierarchy and normal view', async () => {
      renderComponent();

      expect(
        await screen.findByRole('link', { name: 'datasets.dataset: dataset 1' })
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

    it('for facility cycle hierarchy and card view', async () => {
      history.replace('/?view=card');

      renderComponent();

      expect(
        await screen.findByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/1?view=card'
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

    it('for data publication hierarchy and normal view', async () => {
      renderComponent(true);

      expect(
        await screen.findByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/1'
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

    it('for data publication hierarchy and card view', async () => {
      history.push('/?view=card');

      renderComponent(true);

      expect(
        await screen.findByRole('link', { name: 'datasets.dataset: dataset 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/1?view=card'
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
  });

  describe('links to the correct url in the datafiles tab', () => {
    it('for facility cycle hierarchy and normal view', async () => {
      renderComponent();

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
      history.replace('/?view=card');
      renderComponent();

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
      history.replace('/?view=card');
      renderComponent(true);

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
      history.replace('/?view=card');
      renderComponent(true);

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

  it('users displayed correctly', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], investigationUsers: investigationUser }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByLabelText('landing-investigation-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith');
    expect(
      await screen.findByLabelText('landing-investigation-user-1')
    ).toHaveTextContent('Local Contact: Jane Smith');
    expect(
      await screen.findByLabelText('landing-investigation-user-2')
    ).toHaveTextContent('Experimenter: Jesse Smith');
  });

  it('renders text "No samples" when no data is present', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], samples: noSamples }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText('investigations.details.samples.no_samples')
    ).toBeInTheDocument();
  });

  it('renders text "No publications" when no data is present', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], publications: noPublication }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText(
        'investigations.details.publications.no_publications'
      )
    ).toBeInTheDocument();
  });

  it('publications displayed correctly', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], publications: publication }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText('Journal, Author, Date, DOI')
    ).toBeInTheDocument();
  });

  it('samples displayed correctly', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], samples: sample }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(await screen.findByText('Sample')).toBeInTheDocument();
  });

  it('displays citation correctly when study missing', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], studyInvestigations: undefined }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText(
        '2019: Test title 1, doi_constants.publisher.name, https://doi.org/doi 1'
      )
    ).toBeInTheDocument();
  });

  it('displays citation correctly with one user', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [
            { ...initialData[0], investigationUsers: [investigationUser[0]] },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText(
        'John Smith; 2019: Test title 1, doi_constants.publisher.name, https://doi.org/doi 1'
      )
    ).toBeInTheDocument();
  });

  it('displays citation correctly with multiple users', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [{ ...initialData[0], investigationUsers: investigationUser }],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(
      await screen.findByText(
        'John Smith et al; 2019: Test title 1, doi_constants.publisher.name, https://doi.org/doi 1'
      )
    ).toBeInTheDocument();
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });

  it('displays Experiment DOI (PID) and renders the expected Link ', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Data Publication Pid' })
    ).toHaveAttribute('href', 'https://doi.org/Data Publication Pid');
  });

  it('hides suggested section when the investigation does not have a summary', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/investigations')) {
        return Promise.resolve({
          data: [
            {
              ...initialData[0],
              summary: undefined,
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent();

    expect(await screen.findByText('Test title 1')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'investigations.landingPage.similarInvestigations',
      })
    ).toBeNull();
  });
});
