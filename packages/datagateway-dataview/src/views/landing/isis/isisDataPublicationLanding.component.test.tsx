import * as React from 'react';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import { dGCommonInitialState, useDataPublication } from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import ISISDataPublicationLanding from './isisDataPublicationLanding.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDataPublication: jest.fn(),
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
            <ISISDataPublicationLanding
              instrumentId="4"
              dataPublicationId="5"
            />
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
      id: 4,
      contributorType: 'experimenter',
      fullName: '',
    },
  ];

  const investigationInstrument = [
    {
      id: 1,
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
      pid: 'doi 1',
      description: 'foo bar',
      users: users,
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

    (useDataPublication as jest.Mock).mockReturnValue({
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
        screen.getByRole('tab', {
          name: 'datapublications.details.investigations',
        })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation'
      );
    });

    it('in cards view', async () => {
      history.replace('/?view=card');
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

  it('users displayed correctly', async () => {
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-1')
    ).toHaveTextContent('Local Contact: Jane Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-2')
    ).toHaveTextContent('Experimenter: Jesse Smith');
  });

  it('displays DOI and renders the expected link', async () => {
    renderComponent();

    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });
});
