import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISFacilityCyclesTable from './isisFacilityCyclesTable.component';
import { initialState } from '../../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../state/app.types';
import {
  fetchFacilityCyclesRequest,
  filterTable,
  sortTable,
  fetchFacilityCycleCountRequest,
  clearTable,
} from '../../state/actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('ISIS FacilityCycles table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ISISFacilityCyclesTable' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(JSON.stringify({ dgtable: initialState }));
    state.dgtable.data = [
      {
        ID: 1,
        NAME: 'Test 1',
        DESCRIPTION: 'Test 1',
        STARTDATE: '2019-07-03',
        ENDDATE: '2019-07-04',
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISFacilityCyclesTable store={mockStore(state)} instrumentId="1" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISFacilityCyclesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(clearTable());
  });

  it('sends fetchFacilityCycleCount and fetchFacilityCycles actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISFacilityCyclesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgtable: { ...state.dgtable, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[1]).toEqual(
      fetchFacilityCycleCountRequest(1)
    );
    expect(testStore.getActions()[2]).toEqual(fetchFacilityCyclesRequest(1));
  });

  it('sends fetchFacilityCycles action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <ISISFacilityCyclesTable instrumentId="1" store={testStore} />
    );

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchFacilityCyclesRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISFacilityCyclesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('[aria-label="Filter by Name"] input');
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
          <ISISFacilityCyclesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('[aria-label="End Date date filter to"]');
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(
      filterTable('ENDDATE', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(filterTable('ENDDATE', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISFacilityCyclesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('NAME', 'asc'));
  });

  it('renders facilitycycle name as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISFacilityCyclesTable instrumentId="1" />
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
