import * as React from 'react';
import ISISStudyLanding from './isisStudyLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import { dGCommonInitialState, useStudy } from 'datagateway-common';
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
    useStudy: jest.fn(),
  };
});

describe('ISIS Study Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudyLanding instrumentId="4" studyId="5" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

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

  const investigationInstrument = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      instrument: {
        id: 3,
        name: 'LARMOR',
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
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  const initialData = [
    {
      id: 7,
      pid: 'study pid',
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    },
  ];

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    history = createMemoryHistory();
    user = userEvent.setup();

    (useStudy as jest.Mock).mockReturnValue({
      data: initialData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('links to the correct url in the datafiles tab', () => {
    it('in normal view', async () => {
      renderComponent();

      await user.click(
        screen.getByRole('tab', { name: 'studies.details.investigations' })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation'
      );
    });

    it('in cards view', async () => {
      history.replace('/?view=card');
      renderComponent();

      await user.click(
        screen.getByRole('tab', { name: 'studies.details.investigations' })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation'
      );
      expect(history.location.search).toBe('?view=card');
    });
  });

  it('single user displayed correctly', async () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: [investigationUser[0]],
              },
            },
          ],
        },
      ],
    });
    renderComponent();

    expect(await screen.findByTestId('landing-study-user-0')).toHaveTextContent(
      'Principal Investigator: John Smith'
    );
  });

  it('multiple users displayed correctly', async () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    renderComponent();

    expect(await screen.findByTestId('landing-study-user-0')).toHaveTextContent(
      'Principal Investigator: John Smith'
    );
    expect(await screen.findByTestId('landing-study-user-1')).toHaveTextContent(
      'Local Contact: Jane Smith'
    );
    expect(await screen.findByTestId('landing-study-user-2')).toHaveTextContent(
      'Experimenter: Jesse Smith'
    );
    expect(
      await screen.findByText(
        'John Smith et al; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
      )
    ).toBeInTheDocument();
  });

  it('displays DOI and renders the expected link', async () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    renderComponent();

    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });

  it('displays Experiment DOI (PID) and renders the expected link', async () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'study pid' })
    ).toHaveAttribute('href', 'https://doi.org/study pid');
  });
});
