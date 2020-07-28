import React from 'react';
import { StateType } from '../state/app.types';
import { selectStartDate, selectEndDate } from '../state/actions/actions';
import { Provider } from 'react-redux';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import SelectDates from './datePicker.component';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { initialState } from '../state/reducers/dgsearch.reducer';

jest.mock('loglevel');

describe('DatePicker component tests', () => {
  let shallow;
  let state: StateType;
  let mockStore;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'SelectDate' });
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
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      requestReceived: false,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
      settingsLoaded: true,
    };

    mockStore = configureStore([thunk]);
  });

  it('renders correctly', () => {
    const wrapper = shallow(<SelectDates store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends selectStartDate action when user types number into Start Date input', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SelectDates />
        </MemoryRouter>
      </Provider>
    );

    const startDateInput = wrapper.find(
      '[aria-label="searchBox.start_date_arialabel"]'
    );
    startDateInput.instance().value = '2012 01 01';
    startDateInput.simulate('change');

    expect(testStore.getActions()[0]).toEqual(
      selectStartDate(new Date('2012-01-01'))
    );
  });

  it('sends selectEndDate action when user types number into End Date input', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SelectDates />
        </MemoryRouter>
      </Provider>
    );

    const endDateInput = wrapper.find(
      '[aria-label="searchBox.end_date_arialabel"]'
    );
    endDateInput.instance().value = '2000 01 01';
    endDateInput.simulate('change');
    expect(testStore.getActions()[0]).toEqual(
      selectEndDate(new Date('2000-01-01'))
    );
  });
});
