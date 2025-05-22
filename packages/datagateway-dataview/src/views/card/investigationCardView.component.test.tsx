import {
  dGCommonInitialState,
  DownloadCartItem,
  Investigation,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import InvestigationCardView from './investigationCardView.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

describe('Investigation - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Investigation[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  let cartItems: DownloadCartItem[];

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <InvestigationCardView />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cartItems = [];
    cardData = [
      {
        id: 1,
        fileSize: 1,
        fileCount: 1,
        title: 'Test title 1',
        summary: 'Test summary',
        name: 'Test name 1',
        visitId: 'visit id 1',
        doi: 'doi 1',
        startDate: '2020-01-01',
        endDate: '2020-01-02',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (url.includes('/investigations/count')) {
          return Promise.resolve({
            data: 1,
          });
        }

        if (url.includes('/investigations')) {
          return Promise.resolve({
            data: cardData,
          });
        }

        if (url.includes('/user/cart')) {
          return Promise.resolve({
            data: { cartItems },
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders investigations as cards', async () => {
    renderComponent();

    const cards = await screen.findAllByTestId('card');
    expect(cards).toHaveLength(1);

    const card = within(cards[0]);

    // check that title & description is displayed correctly
    expect(
      within(card.getByLabelText('card-title')).getByRole('link', {
        name: 'Test title 1',
      })
    ).toHaveAttribute('href', '/browse/investigation/1/dataset');
    expect(
      within(card.getByLabelText('card-description')).getByText('Test summary')
    ).toBeInTheDocument();

    // check that investigation doi is displayed correctly
    expect(
      within(card.getByTestId('card-info-investigations.doi')).getByTestId(
        'PublicIcon'
      )
    ).toBeInTheDocument();
    expect(card.getByTestId('card-info-investigations.doi')).toHaveTextContent(
      'investigations.doi'
    );
    expect(
      within(card.getByTestId('card-info-data-investigations.doi')).getByRole(
        'link',
        { name: 'doi 1' }
      )
    ).toHaveAttribute('href', 'https://doi.org/doi 1');

    // check that visit id is displayed correctly
    expect(
      card.getByTestId('card-info-investigations.visit_id')
    ).toHaveTextContent('investigations.visit_id');
    expect(
      within(card.getByTestId('card-info-investigations.visit_id')).getByTestId(
        'FingerprintIcon'
      )
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-investigations.visit_id')
      ).getByText('visit id 1')
    ).toBeInTheDocument();

    // check that investigation name is displayed correctly
    expect(
      card.getByTestId('card-info-investigations.details.name')
    ).toHaveTextContent('investigations.details.name');
    expect(
      within(
        card.getByTestId('card-info-investigations.details.name')
      ).getByTestId('FingerprintIcon')
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-investigations.details.name')
      ).getByText('Test name 1')
    ).toBeInTheDocument();

    // check that investigation size is displayed correctly
    expect(
      card.getByTestId('card-info-investigations.details.size')
    ).toHaveTextContent('investigations.details.size');
    expect(
      within(
        card.getByTestId('card-info-investigations.details.size')
      ).getByTestId('SaveIcon')
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-investigations.details.size')
      ).getByText('1 B')
    ).toBeInTheDocument();

    // check that investigation start date is displayed correctly
    expect(
      card.getByTestId('card-info-investigations.details.start_date')
    ).toHaveTextContent('investigations.details.start_date');
    expect(
      within(
        card.getByTestId('card-info-investigations.details.start_date')
      ).getByTestId('CalendarTodayIcon')
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-investigations.details.start_date')
      ).getByText('2020-01-01')
    ).toBeInTheDocument();

    // check that investigation start date is displayed correctly
    expect(
      card.getByTestId('card-info-investigations.details.end_date')
    ).toHaveTextContent('investigations.details.end_date');
    expect(
      within(
        card.getByTestId('card-info-investigations.details.end_date')
      ).getByTestId('CalendarTodayIcon')
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-investigations.details.end_date')
      ).getByText('2020-01-02')
    ).toBeInTheDocument();

    // check that card buttons are displayed correctly
    expect(
      card.getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'investigations.details.end_date filter to',
    });

    await user.type(filter, '2019-08-06');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by INVESTIGATIONS.TITLE',
      })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });
});
