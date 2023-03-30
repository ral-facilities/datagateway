import { dGCommonInitialState, type Study } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISStudiesCardView from './isisStudiesCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

describe('ISIS Studies - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Study[];
  let history: History;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesCardView instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        pid: 'doi',
        name: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
        studyInvestigations: [
          {
            id: 151,
            investigation: {
              id: 711,
              title: 'investigation title',
              name: 'investigation name',
              visitId: 'IPim0',
              startDate: '1999-01-01',
              endDate: '1999-01-02',
            },
          },
        ],
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

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        switch (url) {
          case '/studies':
            return Promise.resolve({
              data: cardData,
            });

          case '/studies/count':
            return Promise.resolve({
              data: 1,
            });
        }
      });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    const cards = await screen.findAllByTestId('card');
    expect(cards).toHaveLength(1);

    const card = cards[0];
    // card title should be rendered as link to study
    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browseStudyHierarchy/instrument/1/study/1'
    );
    expect(within(card).getByLabelText('card-description')).toHaveTextContent(
      'investigation title'
    );
    expect(within(card).getByRole('link', { name: 'doi' })).toHaveAttribute(
      'href',
      'https://doi.org/doi'
    );
    expect(within(card).getByText('1999-01-01')).toBeInTheDocument();
    expect(within(card).getByText('1999-01-02')).toBeInTheDocument();
  });

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent(
        '{"studyInvestigations.investigation.startDate":"desc"}'
      )}`
    );
  });

  it('updates filter query params on text filter', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by studies.name',
      hidden: true,
    });

    await user.type(filter, 'tes');
    jest.runAllTimers();

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"tes","type":"include"}}'
      )}`
    );

    await user.clear(filter);
    jest.runAllTimers();

    expect(history.location.search).toBe('?');

    jest.useRealTimers();
  });

  it('updates filter query params on date filter', async () => {
    const user = userEvent.setup();
    applyDatePickerWorkaround();

    renderComponent();

    // open advanced filter
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filterInput = screen.getByRole('textbox', {
      name: 'studies.end_date filter to',
    });

    await user.type(filterInput, '2019-08-06');
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"studyInvestigations.investigation.endDate":{"endDate":"2019-08-06"}}'
      )}`
    );

    await user.clear(filterInput);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by STUDIES.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('displays information from investigation when investigation present', async () => {
    cardData = [
      {
        ...cardData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...cardData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];

    renderComponent();

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByLabelText('card-description')).toHaveTextContent(
      'Test investigation'
    );
  });
});
