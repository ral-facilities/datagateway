import * as React from 'react';
import ISISDatasetLanding from './isisDatasetLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  Dataset,
  dGCommonInitialState,
  useDatasetDetails,
  useDatasetSizes,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetDetails: jest.fn(),
    useDatasetSizes: jest.fn(),
  };
});

describe('ISIS Dataset Landing page', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  const renderComponent = (studyHierarchy = false): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetLanding
              instrumentId="4"
              instrumentChildId="5"
              investigationId="1"
              datasetId="87"
              studyHierarchy={studyHierarchy}
            />
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
    history = createMemoryHistory();
    user = userEvent.setup();

    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: initialData,
    });
    (useDatasetSizes as jest.Mock).mockReturnValue({
      data: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      history.replace('/?view=card');
      renderComponent();

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(history.location.pathname).toBe(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      );
      expect(history.location.search).toBe('?view=card');
    });

    it('for study hierarchy and normal view', async () => {
      renderComponent(true);

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset/87/datafile'
      );
    });

    it('for study hierarchy and cards view', async () => {
      history.replace('/?view=card');
      renderComponent(true);

      await user.click(
        await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
      );

      expect(history.location.pathname).toBe(
        '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset/87/datafile'
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

  it('useDatasetSizes queries not sent if no data returned from useDatasetDetails', () => {
    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: undefined,
    });
    renderComponent();
    expect(useDatasetSizes).toHaveBeenCalledWith(undefined);
  });

  it('incomplete datasets render correctly', async () => {
    initialData.complete = false;
    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: initialData,
    });
    renderComponent();

    expect(await screen.findByText('datasets.incomplete')).toBeInTheDocument();
  });
});
