import * as React from 'react';
import {
  dGCommonInitialState,
  SearchResponse,
  SearchResult,
  SearchResultSource,
  FACILITY_NAME,
  StateType,
} from 'datagateway-common';
import InvestigationSearchCardView from './investigationSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

describe('Investigation - Card View', () => {
  let state: StateType;
  let cardData: SearchResultSource;
  let searchResult: SearchResult;
  let searchResponse: SearchResponse;
  let history: MemoryHistory;
  let queryClient: QueryClient;

  function renderComponent({ hierarchy = '' } = {}): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <InvestigationSearchCardView hierarchy={hierarchy} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  }

  const mockAxiosGet = (url: string): Promise<Partial<AxiosResponse>> => {
    if (/\/investigations$/.test(url)) {
      return Promise.resolve({
        data: [],
      });
    }
    if (/\/search\/documents$/.test(url)) {
      // lucene search query
      return Promise.resolve({
        data: searchResponse,
      });
    }
    return Promise.reject({
      message: `Endpoint not mocked ${url}`,
    });
  };

  beforeEach(() => {
    cardData = {
      id: 1,
      name: 'Investigation test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      fileSize: 10,
      fileCount: 9,
      title: 'Test 1',
      visitId: '1',
      doi: 'doi 1',
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
      investigationfacilitycycle: [
        {
          'facilityCycle.id': 6,
        },
      ],
    };
    searchResult = {
      score: 1,
      id: 1,
      source: cardData,
    };
    searchResponse = {
      results: [searchResult],
    };
    history = createMemoryHistory({
      initialEntries: [
        { search: 'searchText=test search&currentTab=investigation' },
      ],
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    (axios.get as jest.Mock).mockImplementation(mockAxiosGet);
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('disables the search query if investigation search is disabled', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append('investigation', 'false');
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    expect(
      screen.queryByTestId('investigation-search-card-view')
    ).toBeInTheDocument();

    // wait for queries to finish fetching
    await waitFor(() => !queryClient.isFetching());

    expect(
      queryClient.getQueryState(['search', 'Investigation'], { exact: false })
        ?.status
    ).toBe('idle');

    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('renders correctly', async () => {
    renderComponent();

    const cards = await screen.findAllByTestId('card');
    expect(cards).toHaveLength(1);

    const card = cards[0];
    expect(within(card).getByText('Test 1')).toBeInTheDocument();
    expect(
      within(card).getByText('entity_card.no_description')
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'card-more-info-expand' })
    ).toBeInTheDocument();
    expect(within(card).getByText('investigations.size:')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('renders generic link correctly', async () => {
    renderComponent();

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/investigation/1/dataset'
    );
  });

  it("renders DLS link correctly and doesn't allow for cart selection or download", async () => {
    renderComponent({
      hierarchy: FACILITY_NAME.dls,
    });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/1/dataset'
    );

    expect(
      within(card).queryByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeNull();
    expect(
      within(card).queryByRole('button', { name: 'buttons.download' })
    ).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
    renderComponent({ hierarchy: FACILITY_NAME.isis });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', {
        name: 'Test 1',
      })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/1/dataset'
    );

    expect(within(card).getByText('10 B')).toBeInTheDocument();
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete cardData.investigationinstrument;

    renderComponent({ hierarchy: FACILITY_NAME.isis });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).queryByRole('link', { name: 'Test 1' })).toBeNull();
    expect(within(card).getByText('Test 1')).toBeInTheDocument();
  });

  it('displays generic details panel when expanded', async () => {
    const user = userEvent.setup();

    renderComponent();

    expect(screen.queryByTestId('investigation-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    cardData.investigationinstrument = [];
    cardData.investigationfacilitycycle = [];

    const user = userEvent.setup();

    renderComponent({ hierarchy: FACILITY_NAME.isis });

    expect(screen.queryByTestId('isis-investigation-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
    const user = userEvent.setup();

    renderComponent({
      hierarchy: FACILITY_NAME.isis,
    });

    expect(screen.queryByTestId('isis-investigation-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    const panel = await screen.findByTestId('isis-investigation-details-panel');
    expect(panel).toBeInTheDocument();

    await user.click(
      within(panel).getByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    await waitFor(() => {
      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/6/investigation/1/dataset'
      );
    });
  });

  it('displays correct details panel for DLS when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({
      hierarchy: FACILITY_NAME.dls,
    });

    expect(screen.queryByTestId('dls-visit-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('dls-visit-details-panel')
    ).toBeInTheDocument();
  });
});
