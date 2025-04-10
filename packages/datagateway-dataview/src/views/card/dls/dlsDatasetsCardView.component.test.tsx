import {
  Dataset,
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatasetsCardView from './dlsDatasetsCardView.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, History } from 'history';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: vi.fn(),
    useDatasetsPaginated: vi.fn(),
  };
});

describe('DLS Datasets - Card View', () => {
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
            <DLSDatasetsCardView investigationId="1" proposalName="test" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Test 1',
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        fileSize: 1,
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

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datasets$/.test(url)) {
          return Promise.resolve({
            data: cardData,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    // Prevent error logging
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      name: 'datasets.details.end_date filter to',
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
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useDatasetsPaginated).toHaveBeenCalledTimes(2);
    expect(useDatasetsPaginated).toHaveBeenCalledWith(expect.anything(), false);
    expect(useDatasetsPaginated).toHaveBeenLastCalledWith(
      expect.anything(),
      true
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by DATASETS.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"desc"}')}`
    );
  }, 10000);

  it('displays details panel when more information is expanded', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      await screen.findByTestId('dls-dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('renders buttons correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
