import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  Investigation,
  Instrument,
  FacilityCycle,
  useInvestigation,
  useFacilityCyclesByInvestigation,
  useInstrumentsPaginated,
  NotificationType,
} from 'datagateway-common';
import { Router } from 'react-router';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import DoiRedirect from './doiRedirect.component';
import { createLocation, createMemoryHistory } from 'history';
import * as log from 'loglevel';
import { AnyAction } from 'redux';

jest.mock('loglevel');

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: jest.fn(),
    useInstrumentsPaginated: jest.fn(),
    useFacilityCyclesByInvestigation: jest.fn(),
  };
});

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule, // use actual for all non-hook parts
    useParams: () => ({
      facilityName: 'ISIS',
      entityName: 'investigation',
      entityId: '1',
    }),
  };
});

describe('DOI Redirect page', () => {
  let mount;
  let history;
  let mockInvestigationData: Investigation[] = [];
  let mockInstrumentData: Instrument[] = [];
  let mockFacilityCycleData: FacilityCycle[] = [];

  const createWrapper = (): ReactWrapper => {
    return mount(
      <Router history={history}>
        <QueryClientProvider client={new QueryClient()}>
          <DoiRedirect />
        </QueryClientProvider>
      </Router>
    );
  };

  beforeEach(() => {
    mount = createMount();

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
      },
    ];
    mockInstrumentData = [
      {
        id: 2,
        name: 'instrument1',
      },
    ];
    mockFacilityCycleData = [
      {
        id: 3,
        name: 'facilitycycle1',
        startDate: '2022-04-01 00:00:00',
        endDate: '2022-04-02 00:00:00',
      },
    ];

    (useInvestigation as jest.Mock).mockReturnValue({
      data: mockInvestigationData,
      isLoading: false,
    });
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: mockInstrumentData,
      isLoading: false,
    });
    (useFacilityCyclesByInvestigation as jest.Mock).mockReturnValue({
      data: mockFacilityCycleData,
      isLoading: false,
      isIdle: false,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('redirects to correct link when everything loads correctly', async () => {
    createWrapper();

    expect(useInvestigation).toHaveBeenCalledWith(1);
    expect(useInstrumentsPaginated).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigationInstruments.investigation.id': { eq: 1 },
        }),
      },
    ]);
    expect(useFacilityCyclesByInvestigation).toHaveBeenCalledWith(
      '2022-04-01 00:00:00'
    );
    expect(history.location.pathname).toBe(
      '/browse/instrument/2/facilityCycle/3/investigation/1/dataset'
    );
  });

  it('displays loading spinner when things are loading', async () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });
    let wrapper = createWrapper();

    expect(wrapper.find('Preloader').exists()).toBe(true);
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    (useInvestigation as jest.Mock).mockReturnValue({
      data: mockInvestigationData,
      isLoading: false,
    });
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });
    wrapper = createWrapper();

    expect(wrapper.find('Preloader').exists()).toBe(true);
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: mockInstrumentData,
      isLoading: false,
    });
    (useFacilityCyclesByInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isIdle: false,
    });
    wrapper = createWrapper();

    expect(wrapper.find('Preloader').exists()).toBe(true);
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);

    (useFacilityCyclesByInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isIdle: true,
    });
    wrapper = createWrapper();

    expect(wrapper.find('Preloader').exists()).toBe(true);
    expect(wrapper.find('Preloader').prop('loading')).toBe(true);
  });

  it('throws error and redirects to homepage if data invalid', async () => {
    let events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    createWrapper();

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

    history.push('/doi-redirect/LILS/investigation/1');
    events = [];
    (log.error as jest.Mock).mockClear();
    (useInvestigation as jest.Mock).mockReturnValue({
      data: mockInvestigationData,
      isLoading: false,
    });
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    createWrapper();

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

    history.push('/doi-redirect/LILS/investigation/1');
    events = [];
    (log.error as jest.Mock).mockClear();
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
      data: mockInstrumentData,
      isLoading: false,
    });
    (useFacilityCyclesByInvestigation as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isIdle: false,
    });
    createWrapper();

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
