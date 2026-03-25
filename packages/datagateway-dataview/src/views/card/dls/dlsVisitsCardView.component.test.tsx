import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  dGCommonInitialState,
  useInvestigationCount,
  useInvestigationsPaginated,
  type Investigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSVisitsCardView from './dlsVisitsCardView.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: vi.fn(),
    useInvestigationsPaginated: vi.fn(),
  };
});

describe('DLS Visits - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Investigation[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.dlsVisit}
                element={<DLSVisitsCardView />}
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
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
        fileSize: 1,
        fileCount: 1,
      },
    ];
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.dlsVisit, {
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

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useInvestigationsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isPending: false,
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: cardData,
          });
        }

        if (/\/status$/.test(url)) {
          return Promise.resolve({ data: {} });
        }

        if (/\/allowed$/.test(url)) {
          return Promise.resolve({ data: true });
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
      name: 'Filter by investigations.visit_id',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
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
      name: 'investigations.end_date filter to',
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
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useInvestigationsPaginated)
        .mock.calls.filter((call) => call[2] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by INVESTIGATIONS.VISIT_ID',
      })
    );

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"visitId":"asc"}')}`
    );
  });

  it('displays details panel when more information is expanded', async () => {
    renderComponent();
    await user.click(await screen.findByLabelText('card-more-info-expand'));
    expect(
      await screen.findByTestId('dls-visit-details-panel')
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useInvestigationsPaginated, {
      partial: true,
    }).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
