import * as React from 'react';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  useDataPublication,
  useDataPublications,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { generatePath, Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
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
  let user: UserEvent;

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
  ];

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'investigation doi 1.1',
    size: 1,
    investigationInstruments: investigationInstrument,
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
    size: 2,
    investigationInstruments: investigationInstrument,
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  const initialStudyDataPublicationData = {
    id: 5,
    pid: 'doi 1',
    users: users,
    publicationDate: '2019-06-10',
  };
  const initialInvestigationDataPublicationsData = [
    {
      id: 8,
      pid: 'investigation doi 1.1',
      title: 'Title 1',
      description: 'foo bar',
      content: {
        dataCollectionInvestigations: [
          {
            investigation: investigation,
          },
        ],
      },
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    },
    {
      id: 9,
      pid: 'investigation doi 1.2',
      description: 'foo bar 2',
      content: {
        dataCollectionInvestigations: [
          {
            investigation: investigation2,
          },
        ],
      },
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
    const { asFragment } = renderComponent();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders structured data correctly', async () => {
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toBeInTheDocument();

    expect(document.getElementById('dataPublication-5')).toMatchSnapshot();
  });
});
