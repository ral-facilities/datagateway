import ISISDatasetLanding from './isisDatasetLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  Dataset,
  dGCommonInitialState,
  useDatasetDetails,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { generatePath, Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '../../../page/pageContainer.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetDetails: vi.fn(),
    useDatasetSizes: vi.fn(),
  };
});

describe('ISIS Dataset Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetLanding datasetId="87" />
          </QueryClientProvider>
        </Router>
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
    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.landing.isisDatasetLanding, {
          instrumentId: '4',
          investigationId: '1',
          facilityCycleId: '5',
          datasetId: '87',
        }),
      ],
    });
    user = userEvent.setup();

    vi.mocked(useDatasetDetails, { partial: true }).mockReturnValue({
      data: initialData,
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

      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      );
    });

    it('for facility cycle hierarchy and cards view', async () => {
      history.replace({ search: '?view=card' });
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      );
      expect(history.location.search).toBe('?view=card');
    });

    it('for data publication hierarchy and normal view', async () => {
      history.replace(
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

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/87/datafile'
      );
    });

    it('for data publication hierarchy and cards view', async () => {
      history.replace({
        pathname: generatePath(
          paths.dataPublications.landing.isisDatasetLanding,
          {
            instrumentId: '4',
            investigationId: '1',
            dataPublicationId: '5',
            datasetId: '87',
          }
        ),
        search: '?view=card',
      });
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(history.location.pathname).toBe(
        '/browseDataPublications/instrument/4/dataPublication/5/investigation/1/dataset/87/datafile'
      );
      expect(history.location.search).toBe('?view=card');
    });
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
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
