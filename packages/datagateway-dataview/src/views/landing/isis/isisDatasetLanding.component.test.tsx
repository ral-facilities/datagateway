import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISDatasetLanding from './isisDatasetLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  Dataset,
  DatasetType,
  dGCommonInitialState,
  fetchDatasetDetailsRequest,
  fetchDatasetsRequest,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { push } from 'connected-react-router';
import { Typography } from '@material-ui/core';

describe('ISIS Dataset Landing page', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  const initialData: Dataset[] = [
    {
      id: 87,
      name: 'Test 1',
      description: 'foo bar',
      modTime: '2019-06-10',
      createTime: '2019-06-10',
      doi: 'doi 1',
      size: 1,
      startDate: '2019-06-10',
      endDate: '2019-06-11',
      complete: true,
    },
  ];
  const datasetType: DatasetType = {
    id: 1,
    name: 'Type 1',
    description: 'The first type',
  };

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    state.dgcommon.data = initialData;
    state.dgcommon.allIds = [87];

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISDatasetLanding
        store={mockStore(state)}
        instrumentId="4"
        instrumentChildId="5"
        investigationId="1"
        datasetId="87"
        studyHierarchy={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('actions dispatched correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISDatasetLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            datasetId="87"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
    expect(testStore.getActions()[1]).toEqual(fetchDatasetDetailsRequest());

    wrapper.find('#dataset-datafiles-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(3);
    expect(testStore.getActions()[2]).toEqual(
      push(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset/87/datafile'
      )
    );
  });

  it('fetchDetails not dispatched if no data in state', () => {
    state.dgcommon.data = [];
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISDatasetLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            datasetId="87"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
  });

  it('fetchDetails not dispatched if details already present', () => {
    state.dgcommon.data = [
      {
        ...initialData[0],
        type: datasetType,
      },
    ];
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISDatasetLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            datasetId="87"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
  });

  it('incomplete datasets render correctly', () => {
    state.dgcommon.data[0].complete = false;
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISDatasetLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            datasetId="87"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(Typography).last().text()).toEqual(
      'datasets.incomplete'
    );
  });
});
