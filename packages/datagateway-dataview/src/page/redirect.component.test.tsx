import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Datafile,
  Dataset,
  Investigation,
  NotificationType,
  useEntity,
} from 'datagateway-common';
import log from 'loglevel';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { AnyAction } from 'redux';
import { paths } from './pageContainer.component';
import { DoiRedirect, GenericRedirect } from './redirect.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useEntity: vi.fn(),
  };
});

describe('Redirect component', () => {
  let mockInvestigationData: Investigation;
  let mockDatasetData: Dataset;
  let mockDatafileData: Datafile;

  beforeEach(() => {
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

    vi.mocked(useEntity, { partial: true }).mockImplementation((entityName) => {
      if (entityName === 'investigation')
        return {
          data: mockInvestigationData,
          isPending: false,
        };
      if (entityName === 'dataset')
        return {
          data: mockDatasetData,
          isPending: false,
        };
      if (entityName === 'datafile')
        return {
          data: mockDatafileData,
          isPending: false,
        };
      else return {};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DOI Redirect component', () => {
    function renderComponent(): RenderResult {
      return render(
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route path={paths.doiRedirect} element={<DoiRedirect />} />
              <Route path={'*'} element={null} />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      );
    }

    beforeEach(() => {
      window.history.replaceState({}, '', '/doi-redirect/LILS/investigation/1');
    });

    it('redirects to correct link when everything loads correctly', async () => {
      renderComponent();
      expect(window.location.pathname).toBe(
        '/browse/instrument/2/facilityCycle/3/investigation/1/dataset'
      );
    });

    it('displays loading spinner when things are loading', async () => {
      vi.mocked(useEntity, { partial: true }).mockReturnValue({
        data: undefined,
        isPending: true,
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
      vi.mocked(useEntity, { partial: true }).mockReturnValue({
        data: undefined,
        isPending: false,
      });
      renderComponent();

      expect(window.location.pathname).toBe('/datagateway');
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
    let stateTestLinkLocation = '';
    function renderComponent(): RenderResult {
      return render(
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.genericRedirect}
                element={<GenericRedirect />}
              />
              <Route
                path={'/state-test'}
                element={
                  <Link
                    to={stateTestLinkLocation}
                    state={{ fromDataPublication: true }}
                  >
                    Test link
                  </Link>
                }
              />
              <Route path={'*'} element={null} />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      );
    }

    beforeEach(() => {
      stateTestLinkLocation = '';
      window.history.replaceState(
        {},
        '',
        '/redirect/LILS/investigation/name/1'
      );
    });

    it('redirects to correct link when everything loads correctly', async () => {
      window.history.replaceState({}, '', '/redirect/LILS/datafile/name/3');

      renderComponent();
      expect(window.location.pathname).toBe(
        '/browse/investigation/1/dataset/2/datafile'
      );
      expect(window.location.search).toBe(
        `?filters=${encodeURIComponent(
          '{"name":{"value":"datafile3","type":"exact"}}'
        )}`
      );
      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'datafile',
        'name',
        '3',
        {
          filterType: 'include',
          filterValue: JSON.stringify(['dataset.investigation', 'dataset']),
        },
        true
      );
    });

    it('redirects to correct link when everything loads correctly (ISIS hierarchy)', async () => {
      window.history.replaceState({}, '', '/redirect/ISIS/dataset/name/2');
      renderComponent();
      expect(window.location.pathname).toBe(
        '/browse/instrument/2/facilityCycle/3/investigation/1/dataset/2/datafile'
      );
      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'dataset',
        'name',
        '2',
        {
          filterType: 'include',
          filterValue: JSON.stringify([
            'investigation',
            'investigation.investigationInstruments.instrument',
            'investigation.investigationFacilityCycles.facilityCycle',
          ]),
        },
        true
      );
    });

    it('redirects to correct link when everything loads correctly (DLS hierarchy)', async () => {
      window.history.replaceState(
        {},
        '',
        '/redirect/DLS/investigation/visitId/1'
      );
      renderComponent();
      expect(window.location.pathname).toBe(
        '/browse/proposal/investigation1/investigation/1/dataset'
      );
      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'investigation',
        'visitId',
        '1',
        undefined,
        true
      );
    });

    it('redirects to correct link when everything loads correctly (DLS hierarchy at dataset level)', async () => {
      window.history.replaceState({}, '', '/redirect/DLS/dataset/name/2');
      renderComponent();
      expect(window.location.pathname).toBe(
        '/browse/proposal/investigation1/investigation/1/dataset/2/datafile'
      );
      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'dataset',
        'name',
        '2',
        {
          filterType: 'include',
          filterValue: JSON.stringify(['investigation']),
        },
        true
      );
    });

    it('displays loading spinner when things are loading', async () => {
      window.history.replaceState({}, '', '/redirect/ISIS/datafile/name/3');
      vi.mocked(useEntity, { partial: true }).mockReturnValue({
        data: undefined,
        isPending: true,
      });

      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'datafile',
        'name',
        '3',
        {
          filterType: 'include',
          filterValue: JSON.stringify([
            'dataset.investigation',
            'dataset',
            'dataset.investigation.investigationInstruments.instrument',
            'dataset.investigation.investigationFacilityCycles.facilityCycle',
          ]),
        },
        true
      );
    });

    it('throws error and redirects to homepage if no investigation is returned', async () => {
      window.history.replaceState(
        {},
        '',
        '/redirect/ISIS/investigation/name/1'
      );
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(useEntity, { partial: true }).mockReturnValue({
        data: undefined,
        isPending: false,
      });
      renderComponent();

      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'investigation',
        'name',
        '1',
        {
          filterType: 'include',
          filterValue: JSON.stringify({
            investigationInstruments: 'instrument',
            investigationFacilityCycles: 'facilityCycle',
          }),
        },
        true
      );
      expect(window.location.pathname).toBe('/datagateway');
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
      stateTestLinkLocation = '/redirect/DLS/investigation/id/1';
      window.history.replaceState({}, '', '/state-test');
      const events: CustomEvent[] = [];

      document.dispatchEvent = (e: Event) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      };
      vi.mocked(useEntity, { partial: true }).mockReturnValue({
        data: undefined,
        isPending: false,
      });
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole('link'));

      expect(vi.mocked(useEntity, { partial: true })).toHaveBeenCalledWith(
        'investigation',
        'id',
        '1',
        undefined,
        true
      );
      expect(window.location.pathname).toBe('/datagateway');
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
  });
});
