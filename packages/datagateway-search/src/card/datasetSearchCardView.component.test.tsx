import {
  dGCommonInitialState,
  SearchResponse,
  SearchResult,
  SearchResultSource,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import DatasetSearchCardView from './datasetSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, MemoryHistory } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import type { RenderResult } from '@testing-library/react';
import { render, screen, within } from '@testing-library/react';
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
          <DatasetSearchCardView hierarchy={hierarchy} />
        </QueryClientProvider>
      </Router>
    </Provider>
  );
}

describe('Dataset - Card View', () => {
  let state: StateType;
  let cardData: SearchResultSource;
  let searchResult: SearchResult;
  let searchResponse: SearchResponse;
  let history: MemoryHistory;

  const mockAxiosGet = (url: string): Promise<Partial<AxiosResponse>> => {
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
    if (/\/datafiles\/count$/.test(url)) {
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
      name: 'Dataset test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
      'investigation.id': 2,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
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

  it('renders correctly', async () => {
    renderComponent({
      initialState: state,
    });

    const cards = await screen.findAllByTestId('card');
    expect(cards).toHaveLength(1);

    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).getByText('entity_card.no_description')
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'card-more-info-expand' })
    ).toBeInTheDocument();
    expect(
      within(card).getByText('datasets.datafile_count:')
    ).toBeInTheDocument();
    expect(within(card).getByText('1')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('renders generic link & pending count correctly', async () => {
    axios.get = jest.fn((url: string) => {
      if (/\/datafiles\/count$/.test(url)) {
        return new Promise((_) => {
          // never resolve the
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent({ initialState: state });

    expect(
      await screen.findByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/2/dataset/1/datafile');

    expect(await screen.findByText('Calculating...')).toBeInTheDocument();
  });

  it("renders DLS link correctly and doesn't allow for download", async () => {
    renderComponent({
      initialState: state,
      hierarchy: 'dls',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(
      within(card).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );

    expect(
      within(card).getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
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

    renderComponent({
      initialState: state,
      hierarchy: 'isis',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(
      within(card).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1'
    );
    expect(within(card).getByText('1 B')).toBeInTheDocument();
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

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent({
      initialState: state,
      hierarchy: 'isis',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    axios.get = jest.fn((url: string) => {
      if (/\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 2,
              name: 'facility cycle name',
              startDate: '2020-06-11',
              endDate: '2000-06-10',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent({
      initialState: state,
      hierarchy: 'isis',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('displays only the dataset name when there is no generic investigation to link to', async () => {
    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    renderComponent({
      initialState: state,
      hierarchy: 'data',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('displays only the dataset name when there is no DLS investigation to link to', async () => {
    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    renderComponent({
      initialState: state,
      hierarchy: 'dls',
    });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', async () => {
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

    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    renderComponent({ initialState: state, hierarchy: 'isis' });

    const cards = await screen.findAllByTestId('card');
    const card = cards[0];

    expect(within(card).getByText('Dataset test name')).toBeInTheDocument();
    expect(
      within(card).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
  });

  it('displays generic details panel when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialState: state,
    });

    expect(screen.queryByTestId('dataset-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialState: state,
      hierarchy: 'isis',
    });

    expect(screen.queryByTestId('isis-dataset-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('isis-dataset-details-panel')
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

    expect(screen.queryByTestId('isis-dataset-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    const panel = await screen.findByTestId('isis-dataset-details-panel');

    expect(panel).toBeInTheDocument();

    await user.click(
      within(panel).getByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialState: state,
      hierarchy: 'dls',
    });

    expect(screen.queryByTestId('dls-dataset-details-panel')).toBeNull();

    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );

    expect(
      await screen.findByTestId('dls-dataset-details-panel')
    ).toBeInTheDocument();
  });
});
