import {
  dGCommonInitialState,
  type Instrument,
  useInstrumentCount,
  useInstrumentsPaginated,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInstrumentsCardView from './isisInstrumentsCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, type RenderResult, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInstrumentCount: jest.fn(),
    useInstrumentsPaginated: jest.fn(),
  };
});

describe('ISIS Instruments - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Instrument[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView studyHierarchy={false} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    cardData = [
      {
        id: 1,
        name: 'Test 1',
      },
    ];
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useInstrumentCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('correct link used when NOT in studyHierarchy', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle'
    );
  });

  it('correct link used for studyHierarchy', async () => {
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView studyHierarchy={true} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browseStudyHierarchy/instrument/1/study'
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by instruments.name',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

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

    await user.click(
      await screen.findByRole('button', { name: 'Sort by INSTRUMENTS.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when more information is expanded', async () => {
    renderComponent();
    await user.click(await screen.findByLabelText('card-more-info-expand'));
    expect(await screen.findByTestId('instrument-details-panel'));
  });

  it('renders fine with incomplete data', () => {
    (useInstrumentCount as jest.Mock).mockReturnValueOnce({});
    (useInstrumentsPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
