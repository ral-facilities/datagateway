import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatafileTable from './datafileTable.component';
import { initialState } from '../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  fetchDatafilesRequest,
  filterTable,
  sortTable,
  downloadDatafileRequest,
  fetchDatafileCountRequest,
  clearTable,
} from '../state/actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { TableSortLabel } from '@material-ui/core';
import { Table } from 'datagateway-common';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('Datafile table component', () => {
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
        LOCATION: '/test1',
        SIZE: 1,
        MOD_TIME: '2019-07-23',
        DATASET_ID: 1,
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DatafileTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(clearTable());
  });

  it('sends fetchDatafileCount and fetchDatafiles actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgtable: { ...state.dgtable, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[1]).toEqual(fetchDatafileCountRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchDatafilesRequest(1));
  });

  it('sends fetchDatafiles action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<DatafileTable store={testStore} />);

    wrapper.childAt(0).prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchDatafilesRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
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
          <DatafileTable datasetId="1" />
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
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find(TableSortLabel)
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('NAME', 'asc'));
  });

  it('sends downloadData action on click of download button', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('button[aria-label="Download"]').simulate('click');

    expect(testStore.getActions()[1]).toEqual(downloadDatafileRequest(1));
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <DatafileTable store={mockStore(state)} datasetId="1" />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgtable.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders file size as bytes', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-colindex=4]')
        .find('p')
        .text()
    ).toEqual('1 B');
  });
});
