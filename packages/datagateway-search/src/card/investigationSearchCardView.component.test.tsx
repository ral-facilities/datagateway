import * as React from 'react';
import {
  dGCommonInitialState,
  Investigation,
  StateType,
  useAllFacilityCycles,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  useInvestigationsPaginated,
  useLuceneSearch,
} from 'datagateway-common';
import InvestigationSearchCardView from './investigationSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { createMemoryHistory, History } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';

import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import {
  render,
  RenderResult,
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
    useAllFacilityCycles: jest.fn(),
    useLuceneSearch: jest.fn(),
    useInvestigationCount: jest.fn(),
    useInvestigationsPaginated: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('Investigation - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Investigation[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (hierarchy?: string): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <InvestigationSearchCardView hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Investigation test name',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        startDate: '2019-07-24',
        endDate: '2019-07-25',
        title: 'Test 1',
        visitId: '1',
        doi: 'doi 1',
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
      },
    ];
    history = createMemoryHistory();
    mockStore = configureStore([thunk]);
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });

    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });

    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(
      (investigations) =>
        (investigations
          ? 'pages' in investigations
            ? investigations.pages.flat()
            : investigations
          : []
        ).map(() => ({
          data: 1,
          isFetching: false,
          isSuccess: true,
        }))
    );

    (useInvestigationSizes as jest.Mock).mockImplementation((investigations) =>
      (investigations
        ? 'pages' in investigations
          ? investigations.pages.flat()
          : investigations
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

  //The below tests are modified from datasetSearchCardView

  it('updates filter query params on text filter', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    await user.type(
      await screen.findByRole('textbox', {
        name: 'investigations.details.end_date filter to',
      }),
      '2019-08-06'
    );

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(
      await screen.findByRole('textbox', {
        name: 'investigations.details.end_date filter to',
      })
    );

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

  it('renders fine with incomplete data', () => {
    (useInvestigationCount as jest.Mock).mockReturnValue({});
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({});

    renderComponent();

    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('renders generic link & pending count correctly', async () => {
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    renderComponent();

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/investigation/1/dataset'
    );
    expect(
      within(card).getByTestId('card-info-data-investigations.dataset_count')
    ).toHaveTextContent('Calculating...');
  });

  it("renders DLS link correctly and doesn't allow for cart selection or download", async () => {
    renderComponent('dls');

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/1/dataset'
    );
    expect(
      screen.queryByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeNull();
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

    expect(useInvestigationSizes).toHaveBeenCalledWith(cardData);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(undefined);

    const card = (await screen.findAllByTestId('card'))[0];

    expect(
      within(card).getByRole('link', {
        name: 'Test 1',
      })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/1/dataset'
    );
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();

    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
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
    delete cardData[0].investigationInstruments;

    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });
    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    await waitFor(() => {
      expect(within(card).queryByRole('link', { name: 'Test 1' })).toBeNull();
    });
    expect(within(card).getByLabelText('card-title')).toHaveTextContent(
      'Test 1'
    );
  });

  it('displays only the dataset name when there is no generic investigation to link to', async () => {
    delete cardData[0].investigation;
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('data');

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getAllByRole('link')).toHaveLength(2);
    expect(
      within(card).getByRole('link', { name: 'Test 1' })
    ).toBeInTheDocument();
  });

  it('displays only the dataset name when there is no DLS investigation to link to', async () => {
    delete cardData[0].investigation;
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('dls');

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getAllByRole('link')).toHaveLength(2);
    expect(
      within(card).getByRole('link', { name: 'Test 1' })
    ).toBeInTheDocument();
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
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    renderComponent('isis');

    const card = (await screen.findAllByTestId('card'))[0];

    expect(within(card).getAllByRole('link')).toHaveLength(2);
    expect(
      within(card).getByRole('link', { name: 'Test 1' })
    ).toBeInTheDocument();
  });

  it('displays generic details panel when expanded', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeTruthy();
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
    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeTruthy();

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(await screen.findByTestId('visit-details-panel')).toBeTruthy();
  });
});
