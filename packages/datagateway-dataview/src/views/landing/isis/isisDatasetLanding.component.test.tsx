import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
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
import { Typography } from '@material-ui/core';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Router } from 'react-router-dom';

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
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  const createWrapper = (studyHierarchy = false): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
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
  };

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
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    history = createMemoryHistory();

    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: initialData,
    });
    (useDatasetSizes as jest.Mock).mockReturnValue({
      data: 1,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('calls the correct data fetching hooks', () => {
    createWrapper();

    expect(useDatasetDetails).toHaveBeenCalledWith(87);
    expect(useDatasetSizes).toHaveBeenCalledWith(initialData);
  });

  it('links to the correct url in the datafiles tab for both hierarchies and both views', () => {
    const facilityCycleWrapper = createWrapper();

    facilityCycleWrapper
      .find('#dataset-datafiles-tab')
      .first()
      .simulate('click');

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
    );

    history.replace('/?view=card');
    const studyWrapper = createWrapper(true);

    studyWrapper.find('#dataset-datafiles-tab').first().simulate('click');

    expect(history.location.pathname).toBe(
      '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset/87/datafile'
    );
    expect(history.location.search).toBe('?view=card');
  });

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();

    expect(
      wrapper
        .find('[data-testid="isis-dataset-landing-doi-link"]')
        .first()
        .text()
    ).toEqual('doi 1');

    expect(
      wrapper
        .find('[data-testid="isis-dataset-landing-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');
  });

  it('useDatasetSizes queries not sent if no data returned from useDatasetDetails', () => {
    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: undefined,
    });
    createWrapper();
    expect(useDatasetSizes).toHaveBeenCalledWith(undefined);
  });

  it('incomplete datasets render correctly', () => {
    initialData.complete = false;
    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: initialData,
    });
    const wrapper = createWrapper();

    expect(wrapper.find(Typography).last().text()).toEqual(
      'datasets.incomplete'
    );
  });
});
