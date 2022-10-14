import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import {
  dGCommonInitialState,
  readSciGatewayToken,
  useCart,
} from 'datagateway-common';
import { createLocation, createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

import PageContainer, { paths } from './pageContainer.component';
import { checkInstrumentId, checkInvestigationId } from './idCheckFunctions';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useQueryClient,
} from 'react-query';
import { Provider } from 'react-redux';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useCart: jest.fn(() => ({ data: [] })),
    // mock table and cardview to opt out of rendering them in these tests as there's no need
    Table: jest.fn(() => 'MockedTable'),
    CardView: jest.fn(() => 'MockedCardView'),
    readSciGatewayToken: jest.fn(() => originalModule.readSciGatewayToken()),
  };
});

jest.mock('react-query', () => ({
  __esModule: true,
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({
    getQueryData: jest.fn(() => 0),
  })),
  useIsFetching: jest.fn(() => 0),
}));

describe('PageContainer - Tests', () => {
  let queryClient: QueryClient;
  let history: History;
  let user: UserEvent;

  const createWrapper = (
    h: History = history,
    client: QueryClient = queryClient
  ): ReactWrapper => {
    const state: StateType = {
      dgcommon: dGCommonInitialState,
      dgdataview: dgDataViewInitialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    return mount(
      <Provider store={testStore}>
        <Router history={h}>
          <QueryClientProvider client={client}>
            <PageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  const renderComponent = (
    h: History = history,
    client: QueryClient = queryClient
  ): RenderResult => {
    const state: StateType = {
      dgcommon: dGCommonInitialState,
      dgdataview: dgDataViewInitialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
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
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/'],
    });
    user = userEvent.setup();
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(() => 0),
    });
  });

  afterEach(() => {
    (useCart as jest.Mock).mockClear();
  });

  it('displays the correct entity count', async () => {
    history.replace(paths.toggle.investigation);
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(() => 101),
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

    history.push('/browse/instrument');

    await user.click(
      await screen.findByRole('button', { name: 'view-search' })
    );

    expect(history.location.pathname).toBe('/search/isis');

    history.push('/browse/proposal');

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
    (useIsFetching as jest.Mock).mockReturnValueOnce(1);
    renderComponent();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
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
        '"%7D%2C"title"%3A%7B"value"%3A"test"%2C"type"%3A"include"%7D%7D&sort=%7B"startDate"%3A"desc"%7D'
    );
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValue(response);
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
        '%22%7D%7D'
    );

    (readSciGatewayToken as jest.Mock).mockClear();
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
    (checkInvestigationId as jest.Mock).mockResolvedValueOnce(true);

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
    (checkInstrumentId as jest.Mock).mockResolvedValueOnce(true);
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(),
    });
    history.replace(`${paths.studyHierarchy.landing.isisStudyLanding}`);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('StyledRouting')).toBeFalsy();
  });

  it('set view to card if cardview stored in localstorage', () => {
    localStorage.setItem('dataView', 'card');
    history.replace(paths.toggle.investigation);

    createWrapper();

    expect(history.location.search).toBe('?view=card');
  });

  it('displays warning label when browsing data anonymously', async () => {
    const response = { username: 'anon/anon' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('displays warning label when browsing study hierarchy', async () => {
    history.replace(paths.studyHierarchy.toggle.isisStudy);
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    renderComponent();

    expect(
      await screen.findByLabelText('open-data-warning')
    ).toBeInTheDocument();
  });

  it('does not display warning label when logged in', async () => {
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('open-data-warning')).toBeNull();
    });
  });

  it('shows SelectionAlert banner when item selected', async () => {
    // Supply data to make SelectionAlert display
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });
    renderComponent();

    expect(await screen.findByLabelText('selection-alert')).toBeInTheDocument();
  });

  it('does not show SelectionAlert banner when no items are selected', async () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [],
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByLabelText('selection-alert')).toBeNull();
    });
  });

  it('opens download plugin when link in SelectionAlert clicked', async () => {
    // Supply data to make SelectionAlert display
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'selection-alert-link' })
    );

    expect(history.location.pathname).toBe('/download');
  });

  it('shows breadcrumb according to the current path', async () => {
    history.replace(paths.toggle.isisInvestigation);
    renderComponent();

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
  });

  it('does not fetch cart when on homepage (cart request errors when user is viewing homepage unauthenticated)', () => {
    history.replace(paths.homepage);
    renderComponent();

    expect(useCart).not.toHaveBeenCalled();
  });
});
