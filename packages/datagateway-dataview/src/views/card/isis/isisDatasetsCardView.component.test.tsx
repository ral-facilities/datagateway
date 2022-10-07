import {
  type Dataset,
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDatasetsCardView from './isisDatasetsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import { render, type RenderResult, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
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

describe('ISIS Datasets - Card View', () => {
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
            <ISISDatasetsCardView
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
              studyHierarchy={false}
            />
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
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1'
    );
  });

  it('correct link used for studyHierarchy', async () => {
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsCardView
              studyHierarchy={true}
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1'
    );
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

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"createTime":"desc"}')}`
    );
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
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('displays details panel when more information is expanded and navigates to datafiles view when tab clicked', async () => {
    renderComponent();

    await user.click(await screen.findByLabelText('card-more-info-expand'));

    expect(
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', { name: 'datasets.details.label' })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile'
    );
  });

  it('renders fine with incomplete data', () => {
    (useDatasetCount as jest.Mock).mockReturnValueOnce({});
    (useDatasetsPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
