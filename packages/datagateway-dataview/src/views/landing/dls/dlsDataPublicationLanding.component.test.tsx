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
import DLSDataPublicationLanding from './dlsDataPublicationLanding.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
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
      contributorType: 'minter',
      fullName: 'John Smith',
    },
    {
      id: 2,
      contributorType: 'experimenter',
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

  const initialData = {
    id: 7,
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
    publicationDate: '2023-07-20',
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

    (useDataPublication as jest.Mock).mockReturnValue({
      data: initialData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('users displayed correctly', async () => {
    renderComponent();

    expect(
      await screen.findByTestId('landing-dataPublication-user-0')
    ).toHaveTextContent('Principal Investigator: John Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-1')
    ).toHaveTextContent('Experimenter: Jane Smith');
    expect(
      await screen.findByTestId('landing-dataPublication-user-2')
    ).toHaveTextContent('Experimenter: Jesse Smith');
  });

  it('displays DOI and renders the expected link', async () => {
    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'DOI doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
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
});
