import {
  dGCommonInitialState,
  type Instrument,
  useInstrumentCount,
  useInstrumentsPaginated,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInstrumentsCardView from './isisInstrumentsCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInstrumentCount: vi.fn(),
    useInstrumentsPaginated: vi.fn(),
  };
});

describe('ISIS Instruments - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Instrument[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView dataPublication={false} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    cardData = [
      {
        id: 1,
        name: 'Test 1',
      },
    ];
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    vi.mocked(useInstrumentCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useInstrumentsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/instruments$/.test(url)) {
          return Promise.resolve({
            data: cardData,
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

  it('correct link used when NOT in studyHierarchy', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle'
    );
  });

  it('correct link used for studyHierarchy', async () => {
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView dataPublication={true} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browseDataPublications/instrument/1/dataPublication'
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by instruments.name',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
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
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useInstrumentsPaginated).toHaveBeenCalledTimes(2);
    expect(useInstrumentsPaginated).toHaveBeenCalledWith(undefined, false);
    expect(useInstrumentsPaginated).toHaveBeenLastCalledWith(undefined, true);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by INSTRUMENTS.NAME' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when more information is expanded', async () => {
    renderComponent();
    await user.click(await screen.findByLabelText('card-more-info-expand'));
    expect(await screen.findByTestId('instrument-details-panel'));
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useInstrumentCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useInstrumentsPaginated, { partial: true }).mockReturnValueOnce(
      {}
    );

    expect(() => renderComponent()).not.toThrowError();
  });
});
