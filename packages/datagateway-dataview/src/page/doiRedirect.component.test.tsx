import * as React from 'react';
import {
  Investigation,
  NotificationType,
  useInvestigation,
} from 'datagateway-common';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createLocation, createMemoryHistory } from 'history';
import log from 'loglevel';
import { AnyAction } from 'redux';
import { render, type RenderResult, screen } from '@testing-library/react';
import DoiRedirect from './doiRedirect.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: jest.fn(),
  };
});

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
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
  let history;
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

    (useInvestigation as jest.Mock).mockReturnValue({
      data: mockInvestigationData,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to correct link when everything loads correctly', async () => {
    renderComponent();
    expect(history.location.pathname).toBe(
      '/browse/instrument/2/facilityCycle/3/investigation/1/dataset'
    );
  });

  it('displays loading spinner when things are loading', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('throws error and redirects to homepage if no investigation is returned', async () => {
    const events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };
    (useInvestigation as jest.Mock).mockReturnValue({
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
