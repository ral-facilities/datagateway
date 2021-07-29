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

  const testInitiateSearch = jest.fn();

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
      sideLayout: false,
    };

    mockStore = configureStore([thunk]);
  });

  afterEach(() => {
    testInitiateSearch.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<SelectDates store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe('Start date box', () => {
    it('sends selectStartDate action when user types number into Start Date input', () => {
      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
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

    it('initiates search with valid start and end dates', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: new Date('2012 01 01'),
          endDate: new Date('2013 01 01'),
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: new Date('2012 01 01'),
          endDate: null,
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: null,
          endDate: new Date('2012 01 01'),
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: null,
          endDate: null,
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });
  });

  describe('End date box', () => {
    it('sends selectEndDate action when user types number into End Date input', () => {
      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
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

    it('initiates search with valid start and end dates', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: new Date('2012 01 01'),
          endDate: new Date('2013 01 01'),
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: new Date('2012 01 01'),
          endDate: null,
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: null,
          endDate: new Date('2012 01 01'),
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', () => {
      state.dgsearch = {
        ...state.dgsearch,
        selectDate: {
          startDate: null,
          endDate: null,
        },
      };

      const testStore = mockStore(state);
      const wrapper = mount(
        <Provider store={testStore}>
          <MemoryRouter>
            <SelectDates initiateSearch={testInitiateSearch} />
          </MemoryRouter>
        </Provider>
      );
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });
  });
});
