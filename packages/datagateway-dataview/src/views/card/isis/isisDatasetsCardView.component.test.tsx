import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  dGCommonInitialState,
  useDatasetCount,
  useDatasetsPaginated,
  type Dataset,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDatasetsCardView from './isisDatasetsCardView.component';

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

describe('ISIS Datasets - Card View', () => {
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
                path={paths.toggle.isisDataset}
                element={<ISISDatasetsCardView dataPublication={false} />}
              />
              <Route
                path={paths.dataPublications.toggle.isisDataset}
                element={<ISISDatasetsCardView dataPublication={true} />}
              />
              <Route path={paths.standard.isisDatafile} element={null} />
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
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.isisDataset, {
        instrumentId: '1',
        facilityCycleId: '1',
        investigationId: '1',
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

        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: {
              id: 1,
              content: {
                dataCollectionInvestigations: [{ investigation: { id: 1 } }],
              },
            },
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

  it('correct link used when NOT in dataPublication hierarchy', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1'
    );
  });

  it('correct link used for dataPublication hierarchy', async () => {
    window.history.replaceState(
      {},
      '',
      generatePath(paths.dataPublications.toggle.isisDataset, {
        instrumentId: '1',
        dataPublicationId: '1',
        investigationId: '1',
      })
    );

    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'Test 1' }, { timeout: 5_000 })
    ).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/1/dataPublication/1/investigation/1/dataset/1'
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
      name: 'datasets.modified_time filter to',
    });

    await user.type(filter, '2019-08-06');

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByTestId('card')).toBeInTheDocument();

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
      await screen.findByTestId('isis-dataset-details-panel')
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(window.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile'
    );
  });

  it('renders fine with incomplete data', async () => {
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useDatasetsPaginated, { partial: true }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
    expect(
      await screen.findByTestId('isis-datasets-card-view')
    ).toBeInTheDocument();
  });
});
