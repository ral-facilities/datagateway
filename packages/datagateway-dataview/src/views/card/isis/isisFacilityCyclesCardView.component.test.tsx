import {
  dGCommonInitialState,
  FacilityCycle,
  useFacilityCycleCount,
  useFacilityCyclesPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISFacilityCyclesCardView from './isisFacilityCyclesCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useFacilityCycleCount: vi.fn(),
    useFacilityCyclesPaginated: vi.fn(),
  };
});

describe('ISIS Facility Cycles - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: FacilityCycle[];
  let history: History;
  let replaceSpy: MockInstance;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISFacilityCyclesCardView instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    cardData = [
      {
        id: 1,
        name: 'Test 1',
      },
    ];
    history = createMemoryHistory();
    replaceSpy = vi.spyOn(history, 'replace');

    vi.mocked(useFacilityCycleCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useFacilityCyclesPaginated, { partial: true }).mockReturnValue({
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
      name: 'Filter by facilitycycles.name',
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
      name: 'facilitycycles.end_date filter to',
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
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent('{"startDate":"desc"}')}`,
    });

    // check that the data request is sent only once after mounting
    expect(useFacilityCyclesPaginated).toHaveBeenCalledTimes(2);
    expect(useFacilityCyclesPaginated).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
    expect(useFacilityCyclesPaginated).toHaveBeenLastCalledWith(
      expect.anything(),
      true
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by FACILITYCYCLES.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useFacilityCycleCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useFacilityCyclesPaginated, {
      partial: true,
    }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
