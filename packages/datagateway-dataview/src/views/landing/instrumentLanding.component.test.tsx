import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import axios, { AxiosResponse } from 'axios';
import { Instrument, dGCommonInitialState } from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../page/pageContainer.component';
import { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import InstrumentLandingPage from './instrumentLanding.component';

describe('Instrument landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Route path={paths.instrumentLandingPage}>
              <InstrumentLandingPage />
            </Route>
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    );

  let initialData: Instrument;

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: { ...dGCommonInitialState, accessMethods: {} },
      })
    );
    state.dgdataview.landingPageLogo = '/test/image.png';

    window.history.replaceState(
      {},
      '',
      generatePath(paths.instrumentLandingPage, {
        instrumentId: '1',
      })
    );

    initialData = {
      id: 1,
      name: 'b1',
      fullName: 'Beamline 1',
      instrumentScientists: [
        { id: 1, user: { id: 1, name: 'a', fullName: 'Alice' } },
        { id: 2, user: { id: 2, name: 'b', fullName: 'Bob' } },
        { id: 2, user: { id: 2, name: 'c' } },
      ],
      pid: 'pid1',
      description: 'Beamline description',
      type: 'Type1',
      startDate: '2026-06-16',
      endDate: '2026-06-17',
    };

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/instruments$/.test(url)) {
          return Promise.resolve({
            data: [initialData],
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    // renders branding correctly
    expect(
      await screen.findByRole('img', {
        name: 'doi_constants.branding.logo_alt_text',
      })
    ).toHaveAttribute('src', '/test/image.png');

    // displays doi + link correctly
    expect(await screen.findByText('instruments.pid')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'DOI pid1' })
    ).toHaveAttribute('href', 'https://doi.org/pid1');

    // full name and description rendered
    expect(screen.getByText('Beamline 1')).toBeInTheDocument();
    expect(screen.getByText('Beamline description')).toBeInTheDocument();

    // start and end date rendered
    expect(screen.getByText('2026-06-16')).toBeInTheDocument();
    expect(screen.getByText('2026-06-17')).toBeInTheDocument();

    expect(screen.getByText('instruments.owner_value')).toBeInTheDocument();
    expect(
      screen.getByText('instruments.manufacturer_value')
    ).toBeInTheDocument();

    expect(
      await screen.findByTestId('landing-instrument-user-0')
    ).toHaveTextContent('Alice');
    expect(
      await screen.findByTestId('landing-instrument-user-1')
    ).toHaveTextContent('Bob');
    expect(
      screen.queryByTestId('landing-instrument-user-2')
    ).not.toBeInTheDocument();
  });

  it('renders correctly if info is missing', async () => {
    initialData.description = undefined;
    initialData.instrumentScientists = undefined;
    initialData.startDate = undefined;
    initialData.endDate = undefined;
    initialData.fullName = undefined;
    initialData.type = undefined;
    renderComponent();

    // displays doi + link correctly
    expect(
      await screen.findByRole('link', { name: 'DOI pid1' })
    ).toHaveAttribute('href', 'https://doi.org/pid1');

    // expect name to be rendered as fallback if fullName not provided
    expect(screen.getByText('b1')).toBeInTheDocument();

    expect(
      screen.getByText('doi_constants.no_description')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('instruments.details.instrument_scientists.label')
    ).toBeNull();
    expect(screen.queryByText('instruments.type')).toBeNull();
    expect(screen.queryByText('instruments.start_date')).toBeNull();
    expect(screen.queryByText('instruments.end_date')).toBeNull();
  });

  it('renders correctly whilst loading', async () => {
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByText('instruments.manufacturer')
    ).not.toBeInTheDocument();
  });

  it('renders meta tag correctly', async () => {
    renderComponent();

    expect(await screen.findByText('Beamline 1')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById('instrument-1')).toMatchInlineSnapshot(`
      <meta
        content="doi:pid1"
        id="instrument-1"
        name="DC.identifier"
      />
    `);
  });
});
