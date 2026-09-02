import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import axios, { AxiosResponse } from 'axios';
import {
  Datafile,
  Dataset,
  Investigation,
  NotificationType,
  dGCommonInitialState,
  readSciGatewayToken,
} from 'datagateway-common';
import { History, createLocation, createMemoryHistory } from 'history';
import log from 'loglevel';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import { AnyAction } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { paths } from './pageContainer.component';
import { DoiRedirect, GenericRedirect } from './redirect.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: vi
      .fn()
      .mockReturnValue({ sessionId: 'abcdef', username: 'test' }),
  };
});

describe('Redirect component', () => {
  let history: History;
  let mockInvestigationData: Investigation;
  let mockDatasetData: Dataset;
  let mockDatafileData: Datafile;
  const mockStore = configureStore([thunk]);
  let state: StateType;

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    mockInvestigationData = {
      id: 1,
      name: 'investigation1',
      title: 'Investigation 1',
      visitId: '1',
      startDate: '2022-04-01 00:00:00',
      investigationInstruments: [
        {
          id: 401,
          instrument: {
            id: 2,
            name: 'instrument1',
          },
        },
      ],
      investigationFacilityCycles: [
        {
          id: 633,
          facilityCycle: {
            id: 3,
            name: 'facilitycycle1',
            startDate: '2022-04-01 00:00:00',
            endDate: '2022-04-02 00:00:00',
          },
        },
      ],
    };

    mockDatasetData = {
      id: 2,
      name: 'dataset2',
      investigation: mockInvestigationData,
      modTime: '2022-04-01 00:00:00',
      createTime: '2022-04-02 00:00:00',
    };

    mockDatafileData = {
      id: 3,
      name: 'datafile3',
      dataset: mockDatasetData,
      modTime: '2022-04-01 00:00:00',
      createTime: '2022-04-02 00:00:00',
    };

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: [mockInvestigationData],
          });
        }
        if (/\/datasets$/.test(url)) {
          return Promise.resolve({
            data: [mockDatasetData],
          });
        }
        if (/\/datafiles$/.test(url)) {
          return Promise.resolve({
            data: [mockDatafileData],
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('DOI Redirect component', () => {
    function renderComponent(): RenderResult {
      return render(
        <Provider store={mockStore(state)}>
          <Router history={history}>
            <QueryClientProvider client={new QueryClient()}>
              <Route path={paths.doiRedirect}>
                <DoiRedirect />
              </Route>
            </QueryClientProvider>
          </Router>
        </Provider>
      );
    }

    beforeEach(() => {
      history = createMemoryHistory({
        initialEntries: [createLocation('/doi-redirect/LILS/investigation/1')],
      });
    });

    it('redirects to correct link when everything loads correctly', async () => {
      renderComponent();
      await waitFor(() =>
        expect(history.location.pathname).toBe(
          '/browse/instrument/2/facilityCycle/3/investigation/1/dataset'
        )
      );
    });

    it('displays loading spinner when things are loading', async () => {
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((_) => {
            // do nothing, simulating pending promise
            // to test loading state
          })
      );

      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('throws error and redirects to homepage if no investigation is returned', async () => {
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(axios.get).mockResolvedValue({ data: undefined });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderComponent();

      await waitFor(() =>
        expect(history.location.pathname).toBe('/datagateway')
      );
      expect(log.error).toHaveBeenCalledWith(
        'Unable to identify single investigation with id matching 1'
      );
      expect(log.error).toHaveBeenCalledWith('Invalid redirect');
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: NotificationType,
        payload: {
          severity: 'error',
          message:
            'Cannot read the investigation. You may not have read access, or it may not be published yet.',
        },
      });
    });
  });

  describe('Generic Redirect component', () => {
    function renderComponent(): RenderResult {
      return render(
        <Provider store={mockStore(state)}>
          <Router history={history}>
            <QueryClientProvider client={new QueryClient()}>
              <Route path={paths.genericRedirect}>
                <GenericRedirect />
              </Route>
            </QueryClientProvider>
          </Router>
        </Provider>
      );
    }

    beforeEach(() => {
      history = createMemoryHistory({
        initialEntries: [createLocation('/redirect/LILS/investigation/name/1')],
      });
    });

    it('redirects to correct link when everything loads correctly', async () => {
      history.replace('/redirect/LILS/datafile/name/3');

      renderComponent();
      await waitFor(() =>
        expect(history.location.pathname).toBe(
          '/browse/investigation/1/dataset/2/datafile'
        )
      );
      expect(history.location.search).toBe(
        `?filters=${encodeURIComponent(
          '{"name":{"value":"datafile3","type":"exact"}}'
        )}`
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '3' } }));
      params.append(
        'include',
        JSON.stringify(['dataset.investigation', 'dataset'])
      );
      expect(axios.get).toHaveBeenCalledWith('/datafiles', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('redirects to correct link when everything loads correctly (ISIS hierarchy)', async () => {
      history.replace('/redirect/ISIS/dataset/name/2');
      renderComponent();
      await waitFor(() =>
        expect(history.location.pathname).toBe(
          '/browse/instrument/2/facilityCycle/3/investigation/1/dataset/2/datafile'
        )
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '2' } }));
      params.append(
        'include',
        JSON.stringify([
          'investigation',
          'investigation.investigationInstruments.instrument',
          'investigation.investigationFacilityCycles.facilityCycle',
        ])
      );
      expect(axios.get).toHaveBeenCalledWith('/datasets', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('redirects to correct link when everything loads correctly (DLS hierarchy)', async () => {
      history.replace('/redirect/DLS/investigation/visitId/1');
      renderComponent();
      await waitFor(() =>
        expect(history.location.pathname).toBe(
          '/browse/proposal/investigation1/investigation/1/dataset'
        )
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ visitId: { eq: '1' } }));
      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('redirects to correct link when everything loads correctly (DLS hierarchy at dataset level)', async () => {
      history.replace('/redirect/DLS/dataset/name/2');
      renderComponent();
      await waitFor(() =>
        expect(history.location.pathname).toBe(
          '/browse/proposal/investigation1/investigation/1/dataset/2/datafile'
        )
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '2' } }));
      params.append('include', JSON.stringify(['investigation']));
      expect(axios.get).toHaveBeenCalledWith('/datasets', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('displays loading spinner when things are loading', async () => {
      history.replace('/redirect/ISIS/datafile/name/3');
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((_) => {
            // do nothing, simulating pending promise
            // to test loading state
          })
      );

      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '3' } }));
      params.append(
        'include',
        JSON.stringify([
          'dataset.investigation',
          'dataset',
          'dataset.investigation.investigationInstruments.instrument',
          'dataset.investigation.investigationFacilityCycles.facilityCycle',
        ])
      );
      expect(axios.get).toHaveBeenCalledWith('/datafiles', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('throws error and redirects to homepage if no investigation is returned', async () => {
      history.replace('/redirect/ISIS/investigation/name/1');
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(axios.get).mockResolvedValue({ data: undefined });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderComponent();

      await waitFor(() =>
        expect(history.location.pathname).toBe('/datagateway')
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '1' } }));
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
          investigationFacilityCycles: 'facilityCycle',
        })
      );
      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        params,
        headers: { Authorization: 'Bearer null' },
      });

      expect(log.error).toHaveBeenCalledWith(
        'Unable to identify single investigation with name matching 1'
      );
      expect(log.error).toHaveBeenCalledWith('Invalid redirect');
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: NotificationType,
        payload: {
          severity: 'error',
          message:
            'Cannot redirect to the investigation matching the given name: 1. You may not have read access, or the given investigation name may not be valid or unique.',
        },
      });
    });

    it('throws error and redirects to homepage if no investigation is returned with fromDataPublication true', async () => {
      history.replace({
        pathname: '/redirect/DLS/investigation/id/1',
        state: { fromDataPublication: true },
      });
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(axios.get).mockResolvedValue({ data: undefined });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderComponent();

      await waitFor(() =>
        expect(history.location.pathname).toBe('/datagateway')
      );
      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ id: { eq: '1' } }));
      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        params,
        headers: { Authorization: 'Bearer null' },
      });

      expect(log.error).toHaveBeenCalledWith(
        'Unable to identify single investigation with id matching 1'
      );
      expect(log.error).toHaveBeenCalledWith('Invalid redirect');
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: NotificationType,
        payload: {
          severity: 'error',
          message: `Cannot redirect to the investigation matching the given id: 1. It may not be published and you don't have permission to see it yet, or you may not have read access for other reasons`,
        },
      });
    });

    it('does not throw error and redirects to login page if no investigation is returned and user is logged in anonymously', async () => {
      state.dgcommon.anonUserName = 'anon';
      vi.mocked(readSciGatewayToken).mockReturnValue({
        username: 'anon',
        sessionId: 'abcdef',
        token: '1234abcdef',
      });
      history.replace('/redirect/ISIS/investigation/name/1');
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(axios.get).mockResolvedValue({ data: undefined });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderComponent();

      await waitFor(() => expect(history.location.pathname).toBe('/login'));

      const params = new URLSearchParams();
      params.append('order', '"id asc"');
      params.append('where', JSON.stringify({ name: { eq: '1' } }));
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
          investigationFacilityCycles: 'facilityCycle',
        })
      );
      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        params,
        headers: { Authorization: 'Bearer null' },
      });

      expect(log.error).toHaveBeenCalledExactlyOnceWith(
        'Unable to identify single investigation with name matching 1'
      );
      expect(events.length).toBe(0);
    });
  });
});
