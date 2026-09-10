import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderResult, act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  Dataset,
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatasetsCardView from './dlsDatasetsCardView.component';

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
  checkProposalName: vi.fn().mockResolvedValue(true),
}));

describe('DLS Datasets - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Dataset[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.dlsDataset}
                element={<DLSDatasetsCardView />}
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
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        fileSize: 1,
        fileCount: 1,
      },
    ];
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.dlsDataset, {
        investigationId: '1',
        proposalName: 'test',
      })
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

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(window.location.search).not.toContain('filters=');
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

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    await act(async () => {
      await flushPromises();
    });

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useDatasetsPaginated)
        .mock.calls.filter((call) => call[1] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by DATASETS.NAME' })
    );

    expect(window.location.search).toBe(
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

  it('renders fine with incomplete data', async () => {
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
    expect(
      await screen.findByTestId('dls-datasets-card-view')
    ).toBeInTheDocument();
  });
});
