import { ListItemText, MenuItem } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { push } from 'connected-react-router';
import {
  clearData,
  dGCommonInitialState,
  fetchDatasetsRequest,
  sortTable,
  updatePage,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { initialState } from '../../state/reducers/dgdataview.reducer';
import axios from 'axios';
import DatasetCardView from './datasetCardView.component';

describe('Dataset - Card View', () => {
  let mount;
  let shallow;
  let mockStore;
  let store;
  let state: StateType;

  const createWrapper = (): ReactWrapper => {
    store = mockStore(state);
    return mount(<DatasetCardView store={store} investigationId="1" />);
  };

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    mount = createMount();
    shallow = createShallow();
    mockStore = configureStore([thunk]);
    state = {
      dgcommon: dGCommonInitialState,
      dgdataview: initialState,
      router: {
        action: 'POP',
        location: {
          hash: '',
          key: '',
          pathname: '/',
          search: '',
          state: {},
        },
      },
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DatasetCardView store={mockStore(state)} investigationId="1" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('pushSort dispatched when sort button clicked', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('Name');
    button.simulate('click');

    // The push action doesn't have the sort=...?
    expect(store.getActions().length).toEqual(7);
    expect(store.getActions()[2]).toEqual(sortTable('NAME', 'asc'));
    expect(store.getActions()[3]).toEqual(push('?'));
  });

  it('pushPage dispatched when page number is no longer valid', () => {
    const wrapper = createWrapper();
    store = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        totalDataCount: 1,
        query: {
          view: null,
          search: null,
          page: 2,
          results: null,
        },
      },
    });
    wrapper.setProps({ store: store });

    // The push action still references page 2, even though the state should be updated by updatePage?
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[0]).toEqual(updatePage(1));
    expect(store.getActions()[1]).toEqual(push('?page=2'));
    expect(store.getActions()[2]).toEqual(updatePage(1));
    expect(store.getActions()[3]).toEqual(push('?page=2'));
  });

  it.skip('pushResults dispatched onChange', () => {
    // Can't trigger onChange for the Select element. Had a similar issue in DG download with the new version of M-UI
    state = {
      ...state,
      dgcommon: { ...state.dgcommon, totalDataCount: 31 },
    };
    const wrapper = createWrapper();
    console.log(store.getActions());
    console.log(wrapper.find('input[value=10]').debug());

    //wrapper.setProps({ store: testStore });
    //expect(testStore.getActions()[0]).toEqual(clearData());
    //console.log(wrapper.debug());
    //wrapper.find(Select).simulate('change', {target: {name: undefined, value: 30}});
    //wrapper.find(Select).simulate('click');
    wrapper
      .find('input[value=10]')
      .simulate('change', { target: { name: undefined, value: 30 } });
    console.log(wrapper.find(MenuItem).debug());
    //wrapper.find(MenuItem).first().simulate('click');
    console.log(store.getActions());
  });

  it('clearData dispatched on store update', () => {
    const wrapper = createWrapper();
    store = mockStore({
      ...state,
      dgcommon: { ...state.dgcommon, totalDataCount: 1 },
    });
    wrapper.setProps({ store: store });

    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(clearData());
    expect(store.getActions()[1]).toEqual(fetchDatasetsRequest(1));
  });
});
