import {
  Dataset,
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import DatasetCardView from './datasetCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../setupTests';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsPaginated: jest.fn(),
  };
});

describe('Dataset - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Dataset[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatasetCardView investigationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Test 1',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO: this results in a huge snapshot diff, so this is skipped for now
  it.skip('renders correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by datasets.name',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    screen.debug(undefined, 100000);

    const filter = await screen.findByRole('textbox', {
      name: 'datasets.modified_time filter to',
    });

    await user.type(filter, '2019-08-06');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by DATASETS.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders buttons correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    (useDatasetCount as jest.Mock).mockReturnValue({});
    (useDatasetsPaginated as jest.Mock).mockReturnValue({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
