import {
  dGCommonInitialState,
  type Investigation,
  useInvestigationCount,
  useInvestigationsPaginated,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSVisitsCardView from './dlsVisitsCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsPaginated: jest.fn(),
  };
});

describe('DLS Visits - Card View', () => {
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
            <DLSVisitsCardView proposalName="test" />
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
        fileSize: 1,
        fileCount: 1,
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

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: cardData,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'investigations.end_date filter to',
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

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useInvestigationsPaginated).toHaveBeenCalledTimes(2);
    expect(useInvestigationsPaginated).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      false
    );
    expect(useInvestigationsPaginated).toHaveBeenLastCalledWith(
      expect.anything(),
      undefined,
      true
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by INVESTIGATIONS.VISIT_ID',
      })
    );

    expect(history.location.search).toBe(
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
    (useInvestigationCount as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
