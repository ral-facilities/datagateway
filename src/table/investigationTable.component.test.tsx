import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import InvestigationTable from './investigationTable.component';
import { initialState } from '../state/reducers/dgtable.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  fetchInvestigationsRequest,
  filterTable,
  sortTable,
} from '../state/actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { TableSortLabel } from '@material-ui/core';
import Table from './table.component';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('Investigation table component', () => {
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
        TITLE: 'Test 1',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        INSTRUMENT: {
          NAME: 'LARMOR',
        },
        STARTDATE: '2019-07-23',
        ENDDATE: '2019-07-24',
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<InvestigationTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends fetchInvestigations action on load', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest());
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('input').first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(filterTable('TITLE', 'test'));

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(filterTable('TITLE', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find('input').last();
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
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find(TableSortLabel)
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('TITLE', 'asc'));
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <InvestigationTable store={mockStore(state)} />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')(state.dgtable.data[0])
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders investigation title as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <InvestigationTable />
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

  it('renders file size as bytes', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-colindex=6]')
        .find('p')
        .text()
    ).toEqual('1 B');
  });
});
