import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import {
  Investigation,
  NotificationType,
  useInvestigation,
} from 'datagateway-common';
import { History, createLocation, createMemoryHistory } from 'history';
import log from 'loglevel';
import { Router } from 'react-router-dom';
import { AnyAction } from 'redux';
import { DoiRedirect } from './doiRedirect.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule, // use actual for all non-hook parts
    useParams: () => ({
      facilityName: 'LILS',
      entityName: 'investigation',
      entityId: '1',
    }),
  };
});

describe('DOI Redirect page', () => {
  let history: History;
  let mockInvestigationData: Investigation[] = [];

  function renderComponent(): RenderResult {
    return render(
      <Router history={history}>
        <QueryClientProvider client={new QueryClient()}>
          <DoiRedirect />
        </QueryClientProvider>
      </Router>
    );
  }

  beforeEach(() => {
    history = createMemoryHistory({
      initialEntries: [createLocation('/doi-redirect/LILS/investigation/1')],
    });

    mockInvestigationData = [
      {
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
      },
    ];

    vi.mocked(useInvestigation, { partial: true }).mockReturnValue({
      data: mockInvestigationData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to correct link when everything loads correctly', async () => {
    renderComponent();
    expect(history.location.pathname).toBe(
      '/browse/instrument/2/facilityCycle/3/investigation/1/dataset'
    );
  });

  it('displays loading spinner when things are loading', async () => {
    vi.mocked(useInvestigation, { partial: true }).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('throws error and redirects to homepage if no investigation is returned', async () => {
    const events: CustomEvent[] = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };
    vi.mocked(useInvestigation, { partial: true }).mockReturnValue({
      data: [],
      isLoading: false,
    });
    renderComponent();

    expect(history.location.pathname).toBe('/datagateway');
    expect(log.error).toHaveBeenCalledWith('Invalid DOI redirect');
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
