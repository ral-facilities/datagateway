import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState } from '../state/reducers/dgsearch.reducer';
import SelectDates from './datePicker.component';

vi.mock('loglevel');

describe('DatePicker component tests', () => {
  let state: StateType;
  const mockStore = configureStore([thunk]);
  let testStore: ReturnType<typeof mockStore>;

  const testInitiateSearch = vi.fn();

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={testStore}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <SelectDates initiateSearch={testInitiateSearch} />
        </BrowserRouter>
      </Provider>
    );

  beforeEach(() => {
    window.history.replaceState({}, '', '/');

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      settingsLoaded: true,
      sideLayout: false,
    };

    testStore = mockStore(state);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    window.history.replaceState(
      {},
      '',
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

  describe('Start date box', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('pushes URL with new start date value when user types number into Start Date input', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012-01-01');

      expect(window.location.search).toContain('startDate=2012-01-01');
    });

    it('initiates search with valid start and end dates', async () => {
      window.history.replaceState(
        {},
        '',
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
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&startDate=2012-01-01'
      );

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&endDate=2012-01-01'
      );

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    // In v6, date pickers don't allow invalid dates to be entered
    it('displays error message when an invalid date is entered', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012-01-00');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date after the maximum date is entered', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '3000-01-01');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date after the end date is entered', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&endDate=2011-11-21'
      );

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      await user.type(startDateInput, '2012-01-01');

      const errorMessages = await screen.findAllByText(
        'searchBox.invalid_date_range_message'
      );
      expect(errorMessages).toHaveLength(2);

      for (const msg of errorMessages) {
        expect(msg).toBeInTheDocument();
      }
    });

    it('invalid date in URL is ignored', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&startDate=2011-14-21'
      );

      renderComponent();
      const startDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.start_date_arialabel',
      });

      expect(startDateInput).toHaveValue('');
    });
  });

  describe('End date box', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('pushes URL with new end date value when user types number into Start Date input', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2000 01 01');

      expect(window.location.search).toContain('endDate=2000-01-01');
    });

    it('initiates search with valid start and end dates', async () => {
      window.history.replaceState(
        {},
        '',
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
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&startDate=2012-01-01'
      );

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with valid end date and empty start date', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&endDate=2012-01-01'
      );

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    it('initiates search with empty start and end dates', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '{enter}');

      expect(testInitiateSearch).toHaveBeenCalled();
    });

    // In v6, date pickers don't allow invalid dates to be entered
    it('displays error message when an invalid date is entered', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2012-01-00');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date before the minimum date is entered', async () => {
      window.history.replaceState({}, '', '/?searchText=&investigation=false');

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '1203-01-01');

      expect(
        await screen.findByText('searchBox.invalid_date_message')
      ).toBeInTheDocument();
    });

    it('displays error message when a date before the start date is entered', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&startDate=2011-11-21'
      );

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      await user.type(endDateInput, '2010-01-01');

      const errorMessages = await screen.findAllByText(
        'searchBox.invalid_date_range_message'
      );
      expect(errorMessages).toHaveLength(2);

      for (const msg of errorMessages) {
        expect(msg).toBeInTheDocument();
      }
    });

    it('invalid date in URL is ignored', async () => {
      window.history.replaceState(
        {},
        '',
        '/?searchText=&investigation=false&endDate=2011-14-21'
      );

      renderComponent();
      const endDateInput = await screen.findByRole('textbox', {
        name: 'searchBox.end_date_arialabel',
      });

      expect(endDateInput).toHaveValue('');
    });
  });
});
