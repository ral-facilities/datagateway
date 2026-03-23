import { dGCommonInitialState, DownloadCartItem } from 'datagateway-common';
import { BrowserRouter, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';

import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useQueryClient,
} from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import React from 'react';
import { Provider } from 'react-redux';
import PageContainer, { paths } from './pageContainer.component';

vi.mock('loglevel');

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
  let user: ReturnType<typeof userEvent.setup>;
  let cartItems: DownloadCartItem[];
  let holder: HTMLElement;
  let props: React.ComponentProps<typeof PageContainer>;

  const renderComponent = (client: QueryClient = queryClient): RenderResult => {
    const state: StateType = {
      dgcommon: dGCommonInitialState,
      dgdataview: dgDataViewInitialState,
    };
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    return render(
      <Provider store={testStore}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <QueryClientProvider client={client}>
            <PageContainer {...props} />
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    user = userEvent.setup();
    cartItems = [];
    props = {
      loggedInAnonymously: false,
    };

    window.history.replaceState({}, '', '/');

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-search');
    document.body.appendChild(holder);

    vi.mocked(useQueryClient, { partial: true }).mockReturnValue({
      getQueriesData: vi.fn(() => [[[], 0]] as [[], never][]),
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
    window.history.replaceState({}, '', paths.toggle.investigation);
    vi.mocked(useQueryClient, { partial: true }).mockReturnValue({
      getQueriesData: vi.fn(() => [[[], 101]] as [[], never][]),
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

    expect(window.location.pathname).toBe('/search/data');
  });

  it('opens search plugin when icon clicked (ISIS)', async () => {
    window.history.replaceState({}, '', '/browse/instrument');
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(window.location.pathname).toBe('/search/isis');
  });

  it('opens search plugin when icon clicked', async () => {
    window.history.replaceState({}, '', '/browse/proposal');

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(window.location.pathname).toBe('/search/dls');
  });

  it('opens download plugin when Download Cart clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.cart_arialabel' })
    );

    expect(window.location.pathname).toBe('/download');
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
    window.history.replaceState(
      {},
      '',
      '/browse/investigation?filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D'
    );
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(window.location.search).toEqual('');
  });

  it('display clear filters button and clear for filters onClick (/my-data/DLS)', async () => {
    const dateNow = `${new Date(Date.now()).toISOString().split('T')[0]}`;
    window.history.replaceState(
      {},
      '',
      '/my-data/DLS?filters=%7B"startDate"%3A%7B"endDate"%3A" ' +
        dateNow +
        '"%7D%2C"title"%3A%7B"value"%3A"test"%2C"type"%3A"include"%7D%7D&sort=%7B%22startDate%22%3A%22desc%22%7D'
    );
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );
    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(window.location.search).toEqual(
      '?filters=%7B%22startDate%22%3A%7B%22endDate%22%3A%22' +
        dateNow +
        '%22%7D%7D&sort=%7B%22startDate%22%3A%22desc%22%7D'
    );
  });

  it('display disabled clear filters button', async () => {
    window.history.replaceState({}, '', paths.toggle.investigation);
    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });

  it('display filter warning on datafile table', async () => {
    window.history.replaceState(
      {},
      '',
      '/browse/investigation/1/dataset/25/datafile'
    );

    renderComponent();

    expect(
      await screen.findByText('loading.filter_message')
    ).toBeInTheDocument();
  });

  it('switches view button display name when clicked', async () => {
    window.history.replaceState({}, '', paths.toggle.investigation);

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
    window.history.replaceState({}, '', paths.myData.root);

    renderComponent();

    expect(
      await screen.findByRole('combobox', {
        name: 'my_data_table.role_selector',
      })
    ).toBeInTheDocument();
  });

  it('displays doi type selector when on My DOIs route', async () => {
    window.history.replaceState({}, '', paths.dataPublications.dls.myDOIs);

    renderComponent();

    expect(
      await screen.findByRole('group', {
        name: 'my_doi_table.type_button_group_aria_label',
      })
    ).toBeInTheDocument();
  });

  it('displays doi type selector when on All DOIs route', async () => {
    window.history.replaceState({}, '', paths.dataPublications.dls.allDOIs);

    renderComponent();

    expect(
      await screen.findByRole('group', {
        name: 'all_doi_table.type_button_group_aria_label',
      })
    ).toBeInTheDocument();
  });

  it('display filter warning on toggle table', async () => {
    window.history.replaceState(
      {},
      '',
      `${paths.toggle.investigation}?view=table`
    );

    renderComponent();

    expect(await screen.findByLabelText('filter-message')).toHaveTextContent(
      'loading.filter_message'
    );
  });

  it('do not display filter warning on toggle card', async () => {
    window.history.replaceState(
      {},
      '',
      `${paths.toggle.investigation}?view=card`
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('filter-message')).toBeNull();
    });
  });

  it('do not use StyledRouting component on landing pages', async () => {
    vi.mocked(useQueryClient, { partial: true }).mockReturnValue({
      getQueriesData: vi.fn(),
    });
    window.history.replaceState(
      {},
      '',
      generatePath(paths.dataPublications.landing.isisDataPublicationLanding, {
        instrumentId: 1,
        dataPublicationId: 2,
      })
    );

    renderComponent();

    expect(screen.queryByTestId('styled-routing')).toBeNull();
  });

  it('set view to card if cardview stored in localstorage', async () => {
    localStorage.setItem('dataView', 'card');
    window.history.replaceState({}, '', paths.toggle.investigation);

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'page view app.view_table' })
    ).toBeInTheDocument();

    expect(window.location.search).toBe('?view=card');

    localStorage.removeItem('dataView');
  });

  it('displays warning label when browsing data anonymously', async () => {
    props.loggedInAnonymously = true;

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('displays warning label when browsing study hierarchy', async () => {
    window.history.replaceState(
      {},
      '',
      generatePath(paths.dataPublications.toggle.isisDataPublication, {
        instrumentId: 1,
      })
    );

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('does not display warning label when logged in', async () => {
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

    expect(window.location.pathname).toBe('/download');
  });

  it('shows breadcrumb according to the current path', async () => {
    window.history.replaceState(
      {},
      '',
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
    window.history.replaceState({}, '', paths.homepage);
    renderComponent();

    expect(axios.get).not.toHaveBeenCalledWith('/user/cart');
  });
});
