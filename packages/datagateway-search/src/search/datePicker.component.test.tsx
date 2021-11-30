import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import SelectDates from './datePicker.component';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';

jest.mock('loglevel');

describe('DatePicker component tests', () => {
  let mount;
  let state: StateType;
  let mockStore;
  let testStore;
  let history: History;
  let pushSpy;

  const testInitiateSearch = jest.fn();

  const createWrapper = (h: History = history): ReactWrapper => {
    return mount(
      <Provider store={testStore}>
        <Router history={h}>
          <SelectDates initiateSearch={testInitiateSearch} />
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory();
    pushSpy = jest.spyOn(history, 'push');

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
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
    testStore = mockStore(state);
  });

  afterEach(() => {
    testInitiateSearch.mockClear();
  });

  it('renders correctly', () => {
    history.replace(
      '/?searchText=&investigation=false&startDate=2021-10-26&endDate=2021-10-28'
    );

    const wrapper = createWrapper();
    const startDateInput = wrapper.find(
      '[aria-label="searchBox.start_date_arialabel"]'
    );
    expect(startDateInput.exists());
    expect(startDateInput.instance().value).toEqual('2021-10-26');

    const endDateInput = wrapper.find(
      '[aria-label="searchBox.end_date_arialabel"]'
    );
    expect(endDateInput.exists());
    expect(endDateInput.instance().value).toEqual('2021-10-28');
  });

  describe('Start date box', () => {
    it('pushes URL with new start date value when user types number into Start Date input', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.instance().value = '2012 01 01';
      startDateInput.simulate('change');

      expect(pushSpy).toHaveBeenCalledWith('?startDate=2012-01-01');
    });

    it('initiates search with valid start and end dates', () => {
      history.replace(
        '/?searchText=&investigation=false&startDate=2012-01-01&endDate=2013-01-01'
      );

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', () => {
      history.replace('/?searchText=&investigation=false&startDate=2012-01-01');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', () => {
      history.replace('/?searchText=&investigation=false&endDate=2012-01-01');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();

      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('displays error message when an invalid date is entered', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.instance().value = '2012 01 35';
      startDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').first().text()).toEqual(
        'searchBox.invalid_date_message'
      );
    });

    it('displays error message when a date after the maximum date is entered', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.instance().value = '3000 01 01';
      startDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').first().text()).toEqual(
        'searchBox.invalid_date_range_message'
      );
    });

    it('displays error message when a date after the end date is entered', () => {
      history.replace('/?searchText=&investigation=false&endDate=2011-11-21');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      startDateInput.instance().value = '2012 01 01';
      startDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').first().text()).toEqual(
        'searchBox.invalid_date_range_message'
      );
    });

    it('invalid date in URL is ignored', () => {
      history.replace('/?searchText=&investigation=false&startDate=2011-14-21');

      const wrapper = createWrapper();
      const startDateInput = wrapper.find(
        '[aria-label="searchBox.start_date_arialabel"]'
      );
      expect(startDateInput.instance().value).toEqual('');
    });
  });

  describe('End date box', () => {
    it('pushes URL with new end date value when user types number into Start Date input', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.instance().value = '2000 01 01';
      endDateInput.simulate('change');
      expect(pushSpy).toHaveBeenCalledWith('?endDate=2000-01-01');
    });

    it('initiates search with valid start and end dates', () => {
      history.replace(
        '/?searchText=&investigation=false&startDate=2012-01-01&endDate=2013-01-01'
      );

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', () => {
      history.replace('/?searchText=&investigation=false&startDate=2012-01-01');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', () => {
      history.replace('/?searchText=&investigation=false&endDate=2012-01-01');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.simulate('keydown', { key: 'Enter' });
      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('displays error message when an invalid date is entered', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.instance().value = '2012 01 35';
      endDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').text()).toEqual(
        'searchBox.invalid_date_message'
      );
    });

    it('displays error message when a date before the minimum date is entered', () => {
      history.replace('/?searchText=&investigation=false');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.instance().value = '1203 01 01';
      endDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').last().text()).toEqual(
        'searchBox.invalid_date_range_message'
      );
    });

    it('displays error message when a date before the start date is entered', () => {
      history.replace('/?searchText=&investigation=false&startDate=2011-11-21');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      endDateInput.instance().value = '2010 01 01';
      endDateInput.simulate('change');

      expect(wrapper.find('.MuiFormHelperText-filled').last().text()).toEqual(
        'searchBox.invalid_date_range_message'
      );
    });

    it('invalid date in URL is ignored', () => {
      history.replace('/?searchText=&investigation=false&endDate=2011-14-21');

      const wrapper = createWrapper();
      const endDateInput = wrapper.find(
        '[aria-label="searchBox.end_date_arialabel"]'
      );
      expect(endDateInput.instance().value).toEqual('');
    });
  });
});
