import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
  type Dataset,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../page/pageContainer.component';
import type { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import DatasetCardView from './datasetCardView.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: vi.fn(),
    useDatasetsPaginated: vi.fn(),
  };
});

vi.mock('../../../page/idCheckFunctions', () => ({
  checkInstrumentId: vi.fn().mockResolvedValue(true),
  checkStudyDataPublicationId: vi.fn().mockResolvedValue(true),
  checkInstrumentAndFacilityCycleId: vi.fn().mockResolvedValue(true),
}));

describe('Dataset - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Dataset[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.dataset}
                element={<DatasetCardView />}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.dataset, { investigationId: '1' })
    );
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isPending: false,
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

    expect(window.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(window.location.search).toBe('');
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

    expect(window.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(window.location.search).toBe('');
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by DATASETS.NAME' })
    );

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({});
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValue({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
