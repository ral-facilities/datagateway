import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
import configureStore from 'redux-mock-store';
import {
  dGCommonInitialState,
  StateType,
  InvestigationUser,
  readSciGatewayToken,
  useUpdateFilter,
  parseSearchToQuery,
} from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import RoleSelector from './roleSelector.component';
import { flushPromises } from '../setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: jest.fn(),
    useUpdateFilter: jest.fn(),
    parseSearchToQuery: jest.fn(),
  };
});

describe('Role Selector', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let mockData: InvestigationUser[] = [];
  const mockPushFilters = jest.fn();

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <RoleSelector />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: {
          ...dGCommonInitialState,
          urls: {
            ...dGCommonInitialState.urls,
            apiUrl: 'https://example.com/api',
          },
        },
      })
    );

    mockData = [
      {
        id: 1,
        role: 'PI',
      },
      {
        id: 2,
        role: 'experimenter',
      },
    ];
    (axios.get as jest.Mock).mockResolvedValue({
      data: mockData,
    });
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: 'testUser',
    });
    (useUpdateFilter as jest.Mock).mockReturnValue(mockPushFilters);
    (parseSearchToQuery as jest.Mock).mockReturnValue({ filters: {} });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('fetches roles when rendered and displays them in dropdown', async () => {
    const wrapper = createWrapper();

    const params = new URLSearchParams();
    params.append('distinct', JSON.stringify('role'));
    params.append(
      'where',
      JSON.stringify({
        'user.name': { eq: 'testUser' },
      })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/api/investigationusers',
      expect.objectContaining({
        params,
      })
    );
    expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
      params.toString()
    );
    wrapper
      .find('#role-selector')
      .find('[role="button"]')
      .simulate('mousedown', { button: 0 });

    // Flush promises and update the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper.find('[role="listbox"] li[role="option"]').length).toBe(3);
    expect(
      wrapper.find('[role="listbox"] li[role="option"]').at(0).text()
    ).toBe('my_data_table.all_roles');
    expect(
      wrapper.find('[role="listbox"] li[role="option"]').at(1).text()
    ).toBe(mockData[0].role.toLowerCase());
    expect(
      wrapper.find('[role="listbox"] li[role="option"]').at(2).text()
    ).toBe(mockData[1].role);
  });

  it('updates filters when role is selected', async () => {
    const wrapper = createWrapper();

    // Flush promises and update the wrapper.
    await flushPromises();
    wrapper.update();

    const selectInput = wrapper.find('input').first();
    selectInput.simulate('change', { target: { value: 'PI' } });

    selectInput.simulate('change', { target: { value: '' } });

    expect(mockPushFilters).toHaveBeenCalledWith(
      'investigationUsers.role',
      null
    );
  });

  it('parses current role from query params correctly', async () => {
    (parseSearchToQuery as jest.Mock).mockReturnValue({
      filters: {
        'investigationUsers.role': {
          value: 'experimenter',
          type: 'include',
        },
      },
    });

    const wrapper = createWrapper();

    // before roles have been loaded, it should be set to "" as a default
    expect(wrapper.find('input').prop('value')).toBe('');

    // Flush promises and update the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper.find('input').prop('value')).toBe('experimenter');
  });
});
