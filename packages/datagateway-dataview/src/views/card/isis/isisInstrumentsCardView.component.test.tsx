import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  dGCommonInitialState,
  useInstrumentCount,
  useInstrumentsPaginated,
  type Instrument,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInstrumentsCardView from './isisInstrumentsCardView.component';

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
  let user: ReturnType<typeof userEvent.setup>;
  let props: React.ComponentProps<typeof ISISInstrumentsCardView>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.isisInstrument}
                element={<ISISInstrumentsCardView {...props} />}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState({}, '', paths.toggle.isisInstrument);
    props = { dataPublication: false };

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    vi.mocked(useInstrumentCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useInstrumentsPaginated, { partial: true }).mockReturnValue({
      data: cardData,
      isPending: false,
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
    props.dataPublication = true;
    renderComponent();
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

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByTestId('card')).toBeInTheDocument();

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useInstrumentsPaginated)
        .mock.calls.filter((call) => call[1] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Sort by INSTRUMENTS.NAME' })
    );

    expect(window.location.search).toBe(
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
