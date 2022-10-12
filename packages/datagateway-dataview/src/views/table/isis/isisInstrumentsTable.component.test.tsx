import * as React from 'react';
import ISISInstrumentsTable from './isisInstrumentsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  Instrument,
  useInstrumentCount,
  useInstrumentsInfinite,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInstrumentCount: jest.fn(),
    useInstrumentsInfinite: jest.fn(),
  };
});

describe('ISIS Instruments table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Instrument[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (studyHierarchy = false): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsTable studyHierarchy={studyHierarchy} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        fullName: 'Test instrument 1',
        description: 'foo bar',
        url: 'test url',
      },
      {
        id: 2,
        name: 'Test 2',
        description: 'foo bar',
        url: 'test url',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useInstrumentCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInstrumentsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by instruments.name',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 4 characters in "test" = 5 entries
    expect(history.length).toBe(5);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(6);
    expect(history.location.search).toBe('?');
  });

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(await screen.findByText('instruments.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    await user.click(
      (
        await screen.findAllByRole('button', { name: 'Show details' })
      )[0]
    );

    expect(
      await screen.findByTestId('instrument-details-panel')
    ).toBeInTheDocument();
  });

  it('renders names as links when NOT in studyHierarchy', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Test instrument 1' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Test 2' })
    ).toBeInTheDocument();
  });

  it('renders names as links in StudyHierarchy', async () => {
    renderComponent(true);
    expect(
      await screen.findByRole('link', { name: 'Test instrument 1' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Test 2' })
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    (useInstrumentCount as jest.Mock).mockReturnValueOnce({});
    (useInstrumentsInfinite as jest.Mock).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
