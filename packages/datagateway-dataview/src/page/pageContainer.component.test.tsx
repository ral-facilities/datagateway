import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import {
  dGCommonInitialState,
  DownloadCartItem,
  readSciGatewayToken,
} from 'datagateway-common';
import { createMemoryHistory, createPath, History } from 'history';
import { generatePath, Router } from 'react-router-dom';

import PageContainer, { paths } from './pageContainer.component';
import {
  checkInstrumentId as unmockedCheckInstrumentId,
  checkInvestigationId as unmockedCheckInvestigationId,
} from './idCheckFunctions';
import axios, { AxiosResponse } from 'axios';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useQueryClient,
} from '@tanstack/react-query';
import { Provider } from 'react-redux';
import {
  act,
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('loglevel');
vi.mock('./idCheckFunctions');
const checkInstrumentId = vi.mocked(unmockedCheckInstrumentId);
const checkInvestigationId = vi.mocked(unmockedCheckInvestigationId);

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    // mock table and cardview to opt out of rendering them in these tests as there's no need
    Table: vi.fn(() => 'MockedTable'),
    CardView: vi.fn(() => 'MockedCardView'),
    readSciGatewayToken: vi.fn(() => originalModule.readSciGatewayToken()),
  };
});

vi.mock('@tanstack/react-query', async () => ({
  __esModule: true,
  ...(await vi.importActual('@tanstack/react-query')),
  useQueryClient: vi.fn(() => ({
    getQueryData: vi.fn(() => 0),
  })),
  useIsFetching: vi.fn(() => 0),
}));

describe('PageContainer - Tests', () => {
  let queryClient: QueryClient;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  let cartItems: DownloadCartItem[];
  let holder: HTMLElement;

  const renderComponent = (
    h: History = history,
    client: QueryClient = queryClient
  ): RenderResult => {
    const state: StateType = {
      dgcommon: dGCommonInitialState,
      dgdataview: dgDataViewInitialState,
    };
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    return render(
      <Provider store={testStore}>
        <Router history={h}>
          <QueryClientProvider client={client}>
            <PageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/'],
    });
    user = userEvent.setup();
    cartItems = [];

    // @ts-expect-error we need it this way
    delete window.location;
    // @ts-expect-error we need it this way
    window.location = new URL(`http://localhost/`);

    // below code keeps window.location in sync with history changes
    // (needed because useUpdateQueryParam uses window.location not history)
    const historyReplace = history.replace;
    const historyReplaceSpy = vi.spyOn(history, 'replace');
    historyReplaceSpy.mockImplementation((args) => {
      historyReplace(args);
      if (typeof args === 'string') {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${args}`);
      } else {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });
    const historyPush = history.push;
    const historyPushSpy = vi.spyOn(history, 'push');
    historyPushSpy.mockImplementation((args) => {
      historyPush(args);
      if (typeof args === 'string') {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${args}`);
      } else {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-search');
    document.body.appendChild(holder);

    vi.mocked(useQueryClient).mockReturnValue({
      getQueryData: vi.fn(() => 0),
    });

    vi.mocked(axios.get).mockImplementation(
      (url: string): Promise<Partial<AxiosResponse>> => {
        if (url.includes('count')) {
          return Promise.resolve({ data: 0 });
        }

        if (url.includes('/user/cart')) {
          return Promise.resolve({
            data: { cartItems },
          });
        }

        if (/.*\/\w+\/\d+$/.test(url)) {
          // fetch entity information
          return Promise.resolve({
            data: {
              id: 1,
              name: 'Name 1',
              title: 'Title 1',
              visitId: '1',
            },
          });
        }

        return Promise.resolve({ data: [] });
      }
    );
  });

  afterEach(() => {
    document.body.removeChild(holder);
  });

  it('displays the correct entity count', async () => {
    history.replace(paths.toggle.investigation);
    vi.mocked(useQueryClient).mockReturnValue({
      getQueryData: vi.fn(() => 101),
    });

    renderComponent();

    expect(await screen.findByLabelText('view-count')).toHaveTextContent(
      'app.results: 101'
    );
  });

  it('opens search plugin when icon clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(history.location.pathname).toBe('/search/data');

    act(() => {
      history.push('/browse/instrument');
    });

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(history.location.pathname).toBe('/search/isis');

    act(() => {
      history.push('/browse/proposal');
    });

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(history.location.pathname).toBe('/search/dls');
  });

  it('opens download plugin when Download Cart clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.cart_arialabel' })
    );

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe('/download');
  });

  it('do not display loading bar loading false', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
  });

  it('display loading bar when loading true', async () => {
    vi.mocked(useIsFetching).mockReturnValue(1);
    renderComponent();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    vi.mocked(useIsFetching).mockReturnValue(0);
  });

  it('display clear filters button and clear for filters onClick', async () => {
    history.replace(
      '/browse/investigation?filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D'
    );
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(history.location.search).toEqual('?');
  });

  it('display clear filters button and clear for filters onClick (/my-data/DLS)', async () => {
    const dateNow = `${new Date(Date.now()).toISOString().split('T')[0]}`;
    history.replace(
      '/my-data/DLS?filters=%7B"startDate"%3A%7B"endDate"%3A" ' +
        dateNow +
        '"%7D%2C"title"%3A%7B"value"%3A"test"%2C"type"%3A"include"%7D%7D&sort=%7B%22startDate%22%3A%22desc%22%7D'
    );
    const response = { username: 'SomePerson' };
    vi.mocked(readSciGatewayToken).mockReturnValue(response);
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );
    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(history.location.search).toEqual(
      '?filters=%7B%22startDate%22%3A%7B%22endDate%22%3A%22' +
        dateNow +
        '%22%7D%7D&sort=%7B%22startDate%22%3A%22desc%22%7D'
    );

    vi.mocked(readSciGatewayToken).mockClear();
  });

  it('display disabled clear filters button', async () => {
    history.replace(paths.toggle.investigation);
    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });

  it('display filter warning on datafile table', async () => {
    history.replace('/browse/investigation/1/dataset/25/datafile');
    vi.mocked(checkInvestigationId).mockResolvedValueOnce(true);

    renderComponent();

    expect(
      await screen.findByText('loading.filter_message')
    ).toBeInTheDocument();
  });

  it('switches view button display name when clicked', async () => {
    history.replace(paths.toggle.investigation);

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'page view app.view_cards' })
    );

    // Check that the text on the button has changed
    expect(
      await screen.findByRole('button', { name: 'page view app.view_table' })
    ).toBeInTheDocument();
  });

  it('displays role selector when on My Data route', async () => {
    history.replace(paths.myData.root);

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'my_data_table.role_selector' })
    ).toBeInTheDocument();
  });

  it('display filter warning on toggle table', async () => {
    history.replace(`${paths.toggle.investigation}?view=table`);

    renderComponent();

    expect(await screen.findByLabelText('filter-message')).toHaveTextContent(
      'loading.filter_message'
    );
  });

  it('do not display filter warning on toggle card', async () => {
    history.replace(`${paths.toggle.investigation}?view=card`);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('filter-message')).toBeNull();
    });
  });

  it('do not use StyledRouting component on landing pages', async () => {
    vi.mocked(checkInstrumentId).mockResolvedValueOnce(true);
    vi.mocked(useQueryClient).mockReturnValue({
      getQueryData: vi.fn(),
    });
    history.replace(
      generatePath(paths.dataPublications.landing.isisDataPublicationLanding, {
        instrumentId: 1,
        dataPublicationId: 2,
      })
    );

    renderComponent();

    expect(
      await screen.findByTestId('isis-dataPublication-landing')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('styled-routing')).toBeNull();
  });

  it('set view to card if cardview stored in localstorage', async () => {
    localStorage.setItem('dataView', 'card');
    history.replace(paths.toggle.investigation);

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'page view app.view_table' })
    ).toBeInTheDocument();

    expect(history.location.search).toBe('?view=card');

    localStorage.removeItem('dataView');
  });

  it('displays warning label when browsing data anonymously', async () => {
    const response = { username: 'anon/anon' };
    vi.mocked(readSciGatewayToken).mockReturnValue(response);

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('displays warning label when browsing study hierarchy', async () => {
    history.replace(
      generatePath(paths.dataPublications.toggle.isisDataPublication, {
        instrumentId: 1,
      })
    );
    const response = { username: 'SomePerson' };
    vi.mocked(readSciGatewayToken).mockReturnValueOnce(response);

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('does not display warning label when logged in', async () => {
    const response = { username: 'SomePerson' };
    vi.mocked(readSciGatewayToken).mockReturnValueOnce(response);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('open-data-warning')).toBeNull();
    });
  });

  it('shows SelectionAlert banner when item selected', async () => {
    // Supply data to make SelectionAlert display
    cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    renderComponent();

    expect(await screen.findByLabelText('selection-alert')).toBeInTheDocument();
  });

  it('does not show SelectionAlert banner when no items are selected', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('selection-alert')).toBeNull();
    });
  });

  it('opens download plugin when link in SelectionAlert clicked', async () => {
    // Supply data to make SelectionAlert display
    cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'selection-alert-link' })
    );

    expect(history.location.pathname).toBe('/download');
  });

  it('shows breadcrumb according to the current path', async () => {
    history.replace(
      generatePath(paths.toggle.isisInvestigation, {
        instrumentId: 1,
        facilityCycleId: 1,
      })
    );
    renderComponent();

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    const baseBreadcrumb = screen.getByTestId('Breadcrumb-base');
    expect(baseBreadcrumb).toHaveAttribute('href', '/browse/instrument');
    expect(baseBreadcrumb).toHaveTextContent('breadcrumbs.instrument');

    const breadcrumbs = await screen.findAllByTestId(
      /^Breadcrumb-hierarchy-\d+$/
    );
    expect(breadcrumbs[0]).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle'
    );
    expect(within(breadcrumbs[0]).getByText('Name 1')).toBeInTheDocument();
    expect(within(breadcrumbs[1]).getByText('Name 1')).toBeInTheDocument();

    expect(
      within(screen.getByTestId('Breadcrumb-last')).getByText(
        'breadcrumbs.investigation'
      )
    ).toBeInTheDocument();
  });

  it('does not fetch cart when on homepage (cart request errors when user is viewing homepage unauthenticated)', () => {
    history.replace(paths.homepage);
    renderComponent();

    expect(axios.get).not.toHaveBeenCalledWith('/user/cart');
  });
});
