import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatasetTable from './datasetTable.component';
import { initialState } from '../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  fetchDatasetsRequest,
  filterTable,
  sortTable,
  fetchDatasetCountRequest,
  clearTable,
} from '../state/actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Table } from 'datagateway-common';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('Dataset table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(JSON.stringify({ dgtable: initialState }));
    state.dgtable.data = [
      {
        ID: 1,
        NAME: 'Test 1',
        SIZE: 1,
        MOD_TIME: '2019-07-23',
        CREATE_TIME: '2019-07-23',
        INVESTIGATION_ID: 1,
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DatasetTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(clearTable());
  });

  it('sends fetchDatasetCount and fetchDatasets actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgtable: { ...state.dgtable, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[1]).toEqual(fetchDatasetCountRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchDatasetsRequest(1));
  });

  it('sends fetchDatasets action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <DatasetTable investigationId="1" store={testStore} />
    );

    wrapper.childAt(0).prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('input').first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(filterTable('NAME', 'test'));

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(filterTable('NAME', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('input').last();
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(
      filterTable('MOD_TIME', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(filterTable('MOD_TIME', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span')
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('NAME', 'asc'));
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <DatasetTable store={mockStore(state)} investigationId="1" />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgtable.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders Dataset title as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DatasetTable investigationId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-colindex=2]')
        .find('p')
        .children()
    ).toMatchSnapshot();
  });
});
