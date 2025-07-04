import {
  type Dataset,
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../state/app.types';
import DatasetCardView from './datasetCardView.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, type History } from 'history';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: vi.fn(),
    useDatasetsPaginated: vi.fn(),
  };
});

describe('Dataset - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Dataset[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

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
        description: 'Test description',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        fileCount: 1,
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

    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders datasets as cards', async () => {
    renderComponent();

    const cards = await screen.findAllByTestId('card');
    expect(cards).toHaveLength(1);

    const card = within(cards[0]);

    // check that title & description is displayed correctly
    expect(
      within(card.getByLabelText('card-title')).getByRole('link', {
        name: 'Test 1',
      })
    ).toHaveAttribute('href', '/browse/investigation/1/dataset/1/datafile');
    expect(
      within(card.getByLabelText('card-description')).getByText(
        'Test description'
      )
    ).toBeInTheDocument();

    // check that datafile count is displayed correctly
    expect(
      card.getByTestId('card-info-datasets.datafile_count')
    ).toBeInTheDocument();
    expect(
      within(card.getByTestId('card-info-datasets.datafile_count')).getByTestId(
        'ConfirmationNumberIcon'
      )
    ).toBeInTheDocument();
    expect(
      card.getByTestId('card-info-datasets.datafile_count')
    ).toHaveTextContent('datasets.datafile_count');
    expect(
      within(
        card.getByTestId('card-info-data-datasets.datafile_count')
      ).getByText('1')
    ).toBeInTheDocument();

    // check that datafile create time is displayed correctly
    expect(
      card.getByTestId('card-info-datasets.create_time')
    ).toBeInTheDocument();
    expect(
      card.getByTestId('card-info-datasets.create_time')
    ).toHaveTextContent('datasets.create_time');
    expect(
      within(card.getByTestId('card-info-datasets.create_time')).getByTestId(
        'CalendarTodayIcon'
      )
    ).toBeInTheDocument();
    expect(
      within(card.getByTestId('card-info-data-datasets.create_time')).getByText(
        '2019-07-23'
      )
    ).toBeInTheDocument();

    // check that datafile modified time is displayed correctly
    expect(
      card.getByTestId('card-info-datasets.modified_time')
    ).toBeInTheDocument();
    expect(
      card.getByTestId('card-info-datasets.modified_time')
    ).toHaveTextContent('datasets.modified_time');
    expect(
      within(card.getByTestId('card-info-datasets.modified_time')).getByTestId(
        'CalendarTodayIcon'
      )
    ).toBeInTheDocument();
    expect(
      within(
        card.getByTestId('card-info-data-datasets.modified_time')
      ).getByText('2019-07-23')
    ).toBeInTheDocument();

    // check that buttons are displayed correctly
    expect(
      card.getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
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

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.location.search).toBe('?');
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

  it('renders fine with incomplete data', () => {
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({});
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValue({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
