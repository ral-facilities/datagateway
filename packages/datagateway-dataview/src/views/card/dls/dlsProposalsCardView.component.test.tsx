import {
  dGCommonInitialState,
  type Investigation,
  useInvestigationCount,
  useInvestigationsPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSProposalsCardView from './dlsProposalsCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: vi.fn(),
    useInvestigationsPaginated: vi.fn(),
  };
});

describe('DLS Proposals - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Investigation[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSProposalsCardView />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
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

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useInvestigationsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isLoading: false,
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
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useInvestigationsPaginated).toHaveBeenCalledTimes(2);
    expect(useInvestigationsPaginated).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      false
    );
    expect(useInvestigationsPaginated).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      true
    );
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useInvestigationsPaginated, {
      partial: true,
    }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
