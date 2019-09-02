import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DLSDatafilesTable from './DLSDatafilesTable.component';
import { initialState } from '../../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType, Datafile } from '../../state/app.types';
import {
  fetchDatafilesRequest,
  filterTable,
  sortTable,
  downloadDatafileRequest,
} from '../../state/actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { TableSortLabel } from '@material-ui/core';
import Table from '../../table/table.component';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('DLS datafiles table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );

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
        FILESIZE: 1,
        CREATE_TIME: '2019-07-23',
        DATASET_ID: 1,
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DLSDatafilesTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends fetchDatafiles action on load', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSDatafilesTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()[0]).toEqual(fetchDatafilesRequest());
  });

  it('sends filterTable action on filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSDatafilesTable datasetId="1" />
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

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSDatafilesTable datasetId="1" />
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
          <DLSDatafilesTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('button[aria-label="Download"]').simulate('click');

    expect(testStore.getActions()[1]).toEqual(downloadDatafileRequest());
  });

  it("doesn't display download button for datafiles with no location", () => {
    const datafile = state.dgtable.data[0] as Datafile;
    const { LOCATION, ...datafileWithoutLocation } = datafile;
    state.dgtable.data = [datafileWithoutLocation];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSDatafilesTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('button[aria-label="Download"]')).toHaveLength(0);
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <DLSDatafilesTable store={mockStore(state)} datasetId="1" />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')(state.dgtable.data[0])
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders file size as bytes', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSDatafilesTable datasetId="1" />
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
