import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  dGCommonInitialState,
  useInvestigationCount,
  useInvestigationsPaginated,
  type Investigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSProposalsCardView from './dlsProposalsCardView.component';

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
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <DLSProposalsCardView />
          </QueryClientProvider>
        </BrowserRouter>
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
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useInvestigationsPaginated, { partial: true }).mockReturnValue({
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
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(window.location.search).toBe(
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
