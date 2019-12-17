import React from 'react';
import { StateType } from '../state/app.types';
import {
  toggleDataset,
  toggleDatafile,
  toggleInvestigation,
} from '../state/actions/actions';
import { Provider } from 'react-redux';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import CheckBoxesGroup from './checkBoxes.component';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { initialState } from '../state/reducers/dgsearch.reducer';

jest.mock('loglevel');

describe('Checkbox component tests', () => {
  let shallow;
  let state: StateType;
  let mockStore;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      searchText: '',
      text: '',
      selectDate: {
        startDate: null,
        endDate: null,
      },
      checkBox: {
        dataset: true,
        datafile: true,
        investigation: false,
      },
    };

    mockStore = configureStore([thunk]);
  });

  it('renders correctly', () => {
    const wrapper = shallow(<CheckBoxesGroup store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends a toggleDataset action when user clicks checkbox', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <CheckBoxesGroup />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="dataset checkbox"]').simulate('change');

    expect(testStore.getActions()[0]).toEqual(toggleDataset(false));
  });

  it('sends a toggleDatafile action when user clicks checkbox', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <CheckBoxesGroup />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="datafile checkbox"]').simulate('change');

    expect(testStore.getActions()[0]).toEqual(toggleDatafile(false));
  });

  it('sends a toggleInvestigation action when user clicks checkbox', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <CheckBoxesGroup />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="investigation checkbox"]').simulate('change');

    expect(testStore.getActions()[0]).toEqual(toggleInvestigation(true));
  });
});
