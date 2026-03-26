import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  Dataset,
  dGCommonInitialState,
  useDatasetDetails,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDatasetLanding from './isisDatasetLanding.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetDetails: vi.fn(),
    useDatasetSizes: vi.fn(),
  };
});

vi.mock('../../../page/idCheckFunctions', () => ({
  checkInstrumentId: vi.fn().mockResolvedValue(true),
  checkInvestigationId: vi.fn().mockResolvedValue(true),
  checkStudyDataPublicationId: vi.fn().mockResolvedValue(true),
  checkInstrumentAndFacilityCycleId: vi.fn().mockResolvedValue(true),
}));

describe('ISIS Dataset Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.dataPublications.landing.isisDatasetLanding}
                element={<ISISDatasetLanding dataPublication={true} />}
              />
              <Route
                path={paths.landing.isisDatasetLanding}
                element={<ISISDatasetLanding dataPublication={false} />}
              />
              <Route path={paths.standard.isisDatafile} element={null} />
              <Route
                path={paths.dataPublications.standard.isisDatafile}
                element={null}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    );

  const initialData: Dataset = {
    id: 87,
    name: 'Test 1',
    description: 'foo bar',
    modTime: '2019-06-10',
    createTime: '2019-06-10',
    doi: 'doi 1',
    startDate: '2019-06-10',
    endDate: '2019-06-11',
    complete: true,
    type: {
      id: 1,
      name: 'Type 1',
      description: 'The first type',
    },
  };

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    state.dgdataview.pluginHost = '/test/';
    window.history.replaceState(
      {},
      '',
      generatePath(paths.landing.isisDatasetLanding, {
        instrumentId: '4',
        investigationId: '1',
        facilityCycleId: '5',
        datasetId: '87',
      })
    );
    user = userEvent.setup();

    vi.mocked(useDatasetDetails, { partial: true }).mockReturnValue({
      data: initialData,
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: {
              id: 1,
              content: {
                dataCollectionInvestigations: [{ investigation: { id: 1 } }],
              },
            },
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('links to the correct url in the datafiles tab', () => {
    it('for facility cycle hierarchy and normal view', async () => {
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(window.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      );
    });

    it('for facility cycle hierarchy and cards view', async () => {
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?view=card`
      );
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(window.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      );
      expect(window.location.search).toBe('?view=card');
    });

    it('for data publication hierarchy and normal view', async () => {
      window.history.replaceState(
        {},
        '',
        generatePath(paths.dataPublications.landing.isisDatasetLanding, {
          instrumentId: '4',
          investigationId: '1',
          dataPublicationId: '5',
          datasetId: '87',
        })
      );
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(window.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/87/datafile'
      );
    });

    it('for data publication hierarchy and cards view', async () => {
      window.history.replaceState(
        {},
        '',
        `${generatePath(paths.dataPublications.landing.isisDatasetLanding, {
          instrumentId: '4',
          investigationId: '1',
          dataPublicationId: '5',
          datasetId: '87',
        })}?view=card`
      );
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(window.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/87/datafile'
      );
      expect(window.location.search).toBe('?view=card');
    });
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );

    // renders branding correctly
    expect(
      await screen.findByRole('img', { name: 'STFC Logo' })
    ).toHaveAttribute(
      'src',
      expect.stringMatching(/(.*)stfc-logo-white-text\.png/)
    );
  });

  it('incomplete datasets render correctly', async () => {
    initialData.complete = false;
    vi.mocked(useDatasetDetails, { partial: true }).mockReturnValue({
      data: initialData,
    });
    renderComponent();

    expect(await screen.findByText('datasets.incomplete')).toBeInTheDocument();
  });
});
