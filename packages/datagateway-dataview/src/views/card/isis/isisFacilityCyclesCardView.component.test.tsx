import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderResult, act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FacilityCycle,
  dGCommonInitialState,
  useFacilityCycleCount,
  useFacilityCyclesPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISFacilityCyclesCardView from './isisFacilityCyclesCardView.component';

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
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.isisFacilityCycle}
                element={<ISISFacilityCyclesCardView />}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.isisFacilityCycle, {
        instrumentId: '1',
      })
    );

    vi.mocked(useFacilityCycleCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useFacilityCyclesPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isPending: false,
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
      name: 'facilitycycles.end_date filter to',
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

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useFacilityCyclesPaginated)
        .mock.calls.filter((call) => call[1] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by FACILITYCYCLES.NAME' })
    );

    expect(window.location.search).toBe(
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
