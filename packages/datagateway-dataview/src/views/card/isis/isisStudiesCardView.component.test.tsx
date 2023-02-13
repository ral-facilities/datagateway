import { ListItemText } from '@mui/material';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useStudyCount,
  useStudiesPaginated,
  Study,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISStudiesCardView from './isisStudiesCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { parse } from 'date-fns';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest
  .useFakeTimers('modern')
  .setSystemTime(parse('2021-10-27', 'yyyy-MM-dd', 0));

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useStudyCount: jest.fn(),
    useStudiesPaginated: jest.fn(),
  };
});

describe('ISIS Studies - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Study[];
  let history: History;
  let user: UserEvent;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesCardView instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesCardView instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        pid: 'doi',
        name: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
        studyInvestigations: [
          {
            id: 151,
            investigation: {
              id: 711,
              title: 'investigation title',
              name: 'investigation name',
              visitId: 'IPim0',
            },
          },
        ],
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup({
      delay: null,
    });

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useStudyCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('CardView').props()).toMatchSnapshot();
  });

  it('displays Experiment DOI (PID) and renders the expected Link ', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'doi' })).toHaveAttribute(
      'href',
      'https://doi.org/doi'
    );
  });

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent(
        '{"studyInvestigations.investigation.startDate":"desc"}'
      )}`
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by studies.name',
      hidden: true,
    });

    screen.debug(undefined, 10000);

    await user.type(filter, 'tes');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"tes","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find('button').first().simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"studyInvestigations.investigation.endDate":{"endDate":"2019-08-06"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('studies.name');
    button.find('div').simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('displays information from investigation when investigation present', () => {
    cardData = [
      {
        ...cardData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...cardData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
    });

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="card-description"]').last().text()
    ).toEqual('Test investigation');
  });

  it('renders fine with incomplete data', () => {
    (useStudyCount as jest.Mock).mockReturnValueOnce({});
    (useStudiesPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();

    cardData = [
      {
        ...cardData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...cardData[0],
            },
          },
        ],
      },
    ];
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
    });

    expect(() => createWrapper()).not.toThrowError();
  });
});
