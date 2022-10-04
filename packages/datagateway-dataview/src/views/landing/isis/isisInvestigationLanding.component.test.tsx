import React from 'react';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  useInvestigation,
  useInvestigationSizes,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('ISIS Investigation Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  const renderComponent = (studyHierarchy = false): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationLanding
              instrumentId="4"
              instrumentChildId="5"
              investigationId="1"
              studyHierarchy={studyHierarchy}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  const initialData = [
    {
      id: 1,
      title: 'Test 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      size: 1,
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
      studyInvestigations: [
        {
          id: 6,
          investigation: {
            id: 1,
          },
          study: {
            id: 7,
            pid: 'study pid',
            startDate: '2019-06-10',
            endDate: '2019-06-11',
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

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    history = createMemoryHistory();
    user = userEvent.setup();

    (useInvestigation as jest.Mock).mockReturnValue({
      data: initialData,
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([
      {
        data: 1,
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('for study hierarchy and normal view', async () => {
      history.replace('/?view=card');
      renderComponent(true);

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset'
      );
    });

    it('for study hierarchy and cards view', async () => {
      history.replace('/?view=card');
      renderComponent(true);

      await user.click(
        await screen.findByRole('tab', {
          name: 'investigations.details.datasets',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset'
      );
      expect(history.location.search).toBe('?view=card');
    });
  });

  it('users displayed correctly', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: investigationUser }],
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
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], samples: noSamples }],
    });
    renderComponent();

    expect(
      await screen.findByText('investigations.details.samples.no_samples')
    ).toBeInTheDocument();
  });

  it('renders text "No publications" when no data is present', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], publications: noPublication }],
    });
    renderComponent();

    expect(
      await screen.findByText(
        'investigations.details.publications.no_publications'
      )
    ).toBeInTheDocument();
  });

  it('publications displayed correctly', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], publications: publication }],
    });
    renderComponent();

    expect(
      await screen.findByText('Journal, Author, Date, DOI')
    ).toBeInTheDocument();
  });

  it('samples displayed correctly', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], samples: sample }],
    });
    renderComponent();

    expect(await screen.findByText('Sample')).toBeInTheDocument();
  });

  it('displays citation correctly when study missing', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], studyInvestigations: undefined }],
    });
    renderComponent();

    expect(
      await screen.findByText(
        '2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
      )
    ).toBeInTheDocument();
  });

  it('displays citation correctly with one user', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: [investigationUser[0]] }],
    });
    renderComponent();

    expect(
      await screen.findByText(
        'John Smith; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
      )
    ).toBeInTheDocument();
  });

  it('displays citation correctly with multiple users', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: investigationUser }],
    });
    renderComponent();

    expect(
      await screen.findByText(
        'John Smith et al; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
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
      await screen.findByRole('link', { name: 'study pid' })
    ).toHaveAttribute('href', 'https://doi.org/study pid');
  });
});
