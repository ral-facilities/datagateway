import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISInstrumentsTable from './isisInstrumentsTable.component';
import { initialState as dgTableInitialState } from '../../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../state/app.types';
import {
  fetchInstrumentsRequest,
  filterTable,
  sortTable,
  fetchInstrumentDetailsRequest,
  fetchInstrumentCountRequest,
  dGCommonInitialState,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Table } from 'datagateway-common';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { clearTable } from '../../state/actions';

describe('ISIS Instruments table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ISISInstrumentsTable' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgtable: dgTableInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    state.dgcommon.data = [
      {
        ID: 1,
        NAME: 'Test 1',
        FULLNAME: 'Test instrument 1',
        DESCRIPTION: 'foo bar',
      },
      {
        ID: 2,
        NAME: 'Test 2',
        DESCRIPTION: 'foo bar',
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<ISISInstrumentsTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInstrumentsTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(clearTable());
  });

  it('sends fetchInstrumentCount and fetchInstruments actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInstrumentsTable />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgtable: { ...state.dgtable, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[1]).toEqual(fetchInstrumentCountRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchInstrumentsRequest(1));
  });

  it('sends fetchInstruments action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<ISISInstrumentsTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInstrumentsRequest(1));
  });

  it('sends filterTable action on filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInstrumentsTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('input').first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(filterTable('FULLNAME', 'test'));

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(filterTable('FULLNAME', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInstrumentsTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('FULLNAME', 'asc'));
  });

  it('renders details panel correctly and it sends off an FetchInstrumentDetails action', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInstrumentsTable />
        </MemoryRouter>
      </Provider>
    );

    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgtable.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();

    mount(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgtable.data[0],
        detailsPanelResize: jest.fn(),
      })
    );

    expect(testStore.getActions()[1]).toEqual(fetchInstrumentDetailsRequest());
  });

  it('renders names as links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISInstrumentsTable />
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
