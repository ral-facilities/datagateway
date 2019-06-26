import React from 'react';
import ExampleComponent from './example.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { shallow as enzymeShallow, mount as enzymeMount } from 'enzyme';
import configureStore, { MockStoreCreator } from 'redux-mock-store';
import { initialState } from './state/reducers/dgtable.reducer';
import { sortTable, fetchInvestigationsRequest } from './state/actions/actions';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

describe('Example component', () => {
  let shallow: typeof enzymeShallow;
  let mount: typeof enzymeMount;
  let mockStore: MockStoreCreator;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = {
      dgtable: { ...initialState },
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <Provider store={mockStore(state)}>
        <ExampleComponent />
      </Provider>
    );
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('renders circular progress when loading', () => {
    state.dgtable.loading = true;
    const wrapper = shallow(
      <Provider store={mockStore(state)}>
        <ExampleComponent />
      </Provider>
    );
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('sends sortTable action when button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <ExampleComponent />
      </Provider>
    );

    wrapper
      .find('button')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(sortTable('column1', 'ASC'));
  });

  it('sends fetchInvestigations action when button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <ExampleComponent />
      </Provider>
    );

    wrapper
      .find('button')
      .last()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest());
  });
});
