import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SelectDates, { CustomClearButton } from './datePicker.component';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';
import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/setup/setup';

jest.mock('loglevel');

describe('DatePicker component tests', () => {
  let state: StateType;
  let mockStore;
  let testStore;
  let history: History;
  let pushSpy;

  const testInitiateSearch = jest.fn();

  const renderComponent = (h: History = history): RenderResult =>
    render(
      <Provider store={testStore}>
        <Router history={h}>
          <SelectDates initiateSearch={testInitiateSearch} />
        </Router>
      </Provider>
    );

  beforeEach(() => {
    applyDatePickerWorkaround();

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
    jest.clearAllMocks();
    cleanupDatePickerWorkaround();
  });

  it('renders correctly', async () => {
    history.replace(
      '/?searchText=&investigation=false&startDate=2021-10-26&endDate=2021-10-28'
    );

    renderComponent();
    const startDateInput = await screen.findByRole('textbox', {
      name: 'searchBox.start_date_arialabel',
    });
    expect(startDateInput).toBeInTheDocument();
    expect(startDateInput).toHaveValue('2021-10-26');

    const endDateInput = await screen.findByRole('textbox', {
      name: 'searchBox.end_date_arialabel',
    });
    expect(endDateInput).toBeInTheDocument();
    expect(endDateInput).toHaveValue('2021-10-28');
  });

  describe('CustomClearButton', () => {
    const onClear = jest.fn();
    let props: PickersActionBarProps;

    beforeEach(() => {
      props = {
        onClear: onClear,
      };
    });

    it('renders correctly', () => {
      const { asFragment } = render(<CustomClearButton {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('calls onClear when button clicked', async () => {
      const user = userEvent.setup();
      render(<CustomClearButton {...props} />);
      await user.click(await screen.findByRole('button'));
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Start date box', () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('pushes URL with new start date value when user types number into Start Date input', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012 01 01');

      expect(pushSpy).toHaveBeenCalledWith('?startDate=2012-01-01');
    });

    it('initiates search with valid start and end dates', async () => {
      history.replace(
        '/?searchText=&investigation=false&startDate=2012-01-01&endDate=2013-01-01'
      );

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', async () => {
      history.replace('/?searchText=&investigation=false&startDate=2012-01-01');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', async () => {
      history.replace('/?searchText=&investigation=false&endDate=2012-01-01');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('displays error message when an invalid date is entered', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012 01 35');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date after the maximum date is entered', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '3000 01 01');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date after the end date is entered', async () => {
      history.replace('/?searchText=&investigation=false&endDate=2011-11-21');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012 01 01');

      const errorMessages = await screen.findAllByText(
        'searchBox.invalid_date_range_message'
      );
      expect(errorMessages).toHaveLength(2);

      for (const msg of errorMessages) {
        expect(msg).toBeInTheDocument();
      }
    });

    it('invalid date in URL is ignored', async () => {
      history.replace('/?searchText=&investigation=false&startDate=2011-14-21');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      expect(startDateInput).toHaveValue('');
    });
  });

  describe('End date box', () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('pushes URL with new end date value when user types number into Start Date input', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2000 01 01');

      expect(pushSpy).toHaveBeenCalledWith('?endDate=2000-01-01');
    });

    it('initiates search with valid start and end dates', async () => {
      history.replace(
        '/?searchText=&investigation=false&startDate=2012-01-01&endDate=2013-01-01'
      );

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid start date and empty end date', async () => {
      history.replace('/?searchText=&investigation=false&startDate=2012-01-01');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', async () => {
      history.replace('/?searchText=&investigation=false&endDate=2012-01-01');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('displays error message when an invalid date is entered', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2012 01 35');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date before the minimum date is entered', async () => {
      history.replace('/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '1203 01 01');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date before the start date is entered', async () => {
      history.replace('/?searchText=&investigation=false&startDate=2011-11-21');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2010 01 01');

      const errorMessages = await screen.findAllByText(
        'searchBox.invalid_date_range_message'
      );
      expect(errorMessages).toHaveLength(2);

      for (const msg of errorMessages) {
        expect(msg).toBeInTheDocument();
      }
    });

    it('invalid date in URL is ignored', async () => {
      history.replace('/?searchText=&investigation=false&endDate=2011-14-21');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      expect(endDateInput).toHaveValue('');
    });
  });
});
