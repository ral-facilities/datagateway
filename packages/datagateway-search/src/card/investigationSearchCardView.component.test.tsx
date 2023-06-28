import * as React from 'react';
import {
  dGCommonInitialState,
  SearchResponse,
  SearchResult,
  SearchResultSource,
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

function renderComponent({
  initialState,
  history = createMemoryHistory(),
  hierarchy = '',
}): RenderResult {
  return render(
    <Provider store={configureStore([thunk])(initialState)}>
      <Router history={history}>
        <QueryClientProvider client={new QueryClient()}>
          <InvestigationSearchCardView hierarchy={hierarchy} />
        </QueryClientProvider>
      </Router>
    </Provider>
  );
}

describe('Investigation - Card View', () => {
  let state: StateType;
  let cardData: SearchResultSource;
  let searchResult: SearchResult;
  let searchResponse: SearchResponse;
  let history: MemoryHistory;

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
    if (/\/facilitycycles$/.test(url)) {
      return Promise.resolve({
        data: [],
      });
    }
    if (/\/datafiles\/count$/.test(url)) {
      return Promise.resolve({
        data: 1,
      });
    }
    if (/\/datasets\/count$/.test(url)) {
      return Promise.resolve({
        data: 1,
      });
    }
    if (/\/user\/getSize$/.test(url)) {
      return Promise.resolve({
        data: 1,
      });
    }
    if (/\/datasets$/.test(url)) {
      return Promise.resolve({
        data: {
          id: 1,
          name: 'Dataset test name',
          startDate: '1563922800000',
          endDate: '1564009200000',
        },
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
      title: 'Test 1',
      visitId: '1',
      doi: 'doi 1',
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
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
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    axios.get = jest.fn(mockAxiosGet);
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //The below tests are modified from datasetSearchCardView

  it('renders correctly', async () => {
    renderComponent({ initialState: state });

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
    expect(
      within(card).getByText('investigations.dataset_count:')
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('renders generic link & pending count correctly', async () => {
    axios.get = jest.fn((url: string) => {
      if (/\/datasets\/count$/.test(url)) {
        return new Promise((_) => {
          // never resolve the promise to pretend the query is loading
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent({
      initialState: state,
    });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/investigation/1/dataset'
    );
    expect(within(card).getByText('Calculating...')).toBeInTheDocument();
  });

  it("renders DLS link correctly and doesn't allow for cart selection or download", async () => {
    renderComponent({
      initialState: state,
      hierarchy: 'dls',
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
    axios.get = jest.fn((url: string) => {
      if (/\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 6,
              name: 'facility cycle name',
              startDate: '2000-06-10',
              endDate: '2020-06-11',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent({ initialState: state, hierarchy: 'isis' });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', {
        name: 'Test 1',
      })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/1/dataset'
    );

    expect(within(card).getByText('1 B')).toBeInTheDocument();
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent({ initialState: state });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    axios.get = jest.fn((url: string) => {
      if (/\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 4,
              name: 'facility cycle name',
              startDate: '2000-06-10',
              endDate: '2020-06-11',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    delete cardData.investigationinstrument;

    renderComponent({ initialState: state, hierarchy: 'isis' });

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).queryByRole('link', { name: 'Test 1' })).toBeNull();
    expect(within(card).getByText('Test 1')).toBeInTheDocument();
  });

  it('displays generic details panel when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({ initialState: state });

    expect(screen.queryByTestId('investigation-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({ initialState: state, hierarchy: 'isis' });

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

    axios.get = jest.fn((url: string) => {
      if (/\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 4,
              name: 'facility cycle name',
              startDate: '2000-06-10',
              endDate: '2020-06-11',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent({
      history,
      initialState: state,
      hierarchy: 'isis',
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
        '/browse/instrument/4/facilityCycle/4/investigation/1/dataset'
      );
    });
  });

  it('displays correct details panel for DLS when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialState: state,
      hierarchy: 'dls',
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
