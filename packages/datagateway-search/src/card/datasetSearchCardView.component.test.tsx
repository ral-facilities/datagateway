import {
  Dataset,
  dGCommonInitialState,
  useAllFacilityCycles,
  useDatasetCount,
  useDatasetsDatafileCount,
  useDatasetSizes,
  useDatasetsPaginated,
  useLuceneSearch,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import DatasetSearchCardView from './datasetSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsPaginated: jest.fn(),
    useLuceneSearch: jest.fn(),
    useDatasetsDatafileCount: jest.fn(),
    useDatasetSizes: jest.fn(),
    useAllFacilityCycles: jest.fn(),
  };
});

describe('Dataset - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Dataset[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (hierarchy?: string): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatasetSearchCardView hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Dataset test name',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        startDate: '2019-07-24',
        endDate: '2019-07-25',
        investigation: {
          id: 2,
          title: 'Investigation test title',
          name: 'Investigation test name',
          summary: 'foo bar',
          visitId: '1',
          doi: 'doi 1',
          size: 1,
          investigationInstruments: [
            {
              id: 3,
              instrument: {
                id: 4,
                name: 'LARMOR',
              },
            },
          ],
          studyInvestigations: [
            {
              id: 5,
              study: {
                id: 6,
                pid: 'study pid',
                name: 'study name',
                modTime: '2019-06-10',
                createTime: '2019-06-10',
              },
              investigation: {
                id: 2,
                title: 'Investigation test title',
                name: 'Investigation test name',
                visitId: '1',
              },
            },
          ],
          startDate: '2019-06-10',
          endDate: '2019-06-11',
          facility: {
            id: 7,
            name: 'facility name',
          },
        },
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
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
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });
    (useDatasetsDatafileCount as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );
    (useDatasetSizes as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );

    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    await user.type(
      await screen.findByRole('textbox', {
        name: 'datasets.modified_time filter to',
      }),
      '2019-08-06'
    );

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(
      await screen.findByRole('textbox', {
        name: 'datasets.modified_time filter to',
      })
    );

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

  it('renders fine with incomplete data', async () => {
    (useDatasetCount as jest.Mock).mockReturnValue({});
    (useDatasetsPaginated as jest.Mock).mockReturnValue({});

    renderComponent();

    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('renders generic link & pending count correctly', async () => {
    (useDatasetsDatafileCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    renderComponent();

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/2/dataset/1/datafile');
    expect(
      within(card).getByTestId('card-info-data-datasets.datafile_count')
    ).toHaveTextContent('Calculating...');
  });

  it("renders DLS link correctly and doesn't allow for download", async () => {
    renderComponent('dls');

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );

    expect(
      screen.getByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'buttons.download' })
    ).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 6,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    renderComponent('isis');

    expect(useDatasetSizes).toHaveBeenCalledWith(cardData);
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith(undefined);

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', {
        name: 'Dataset test name',
      })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1'
    );

    expect(
      within(card).getByTestId('card-info-data-datasets.size')
    ).toHaveTextContent('1 B');
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });
    delete cardData[0].investigation?.investigationInstruments;

    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });
    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 2,
          name: 'facility cycle name',
          startDate: '2020-06-11',
          endDate: '2000-06-10',
        },
      ],
    });

    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no generic investigation to link to', async () => {
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('data');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no DLS investigation to link to', async () => {
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('dls');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(
        within(card).queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Dataset test name'
    );
  });

  it('displays generic details panel when expanded', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(await screen.findByTestId('dataset-details-panel')).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(await screen.findByTestId('dataset-details-panel')).toBeTruthy();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    renderComponent('isis');
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(await screen.findByTestId('dataset-details-panel')).toBeTruthy();

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(await screen.findByTestId('dataset-details-panel')).toBeTruthy();
  });
});
