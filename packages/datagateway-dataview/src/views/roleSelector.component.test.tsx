import React from 'react';
import axios from 'axios';
import configureStore from 'redux-mock-store';
import {
  dGCommonInitialState,
  InvestigationUser,
  parseSearchToQuery,
  readSciGatewayToken,
  StateType,
  usePushFilter,
} from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import RoleSelector from './roleSelector.component';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: jest.fn(),
    usePushFilter: jest.fn(),
    parseSearchToQuery: jest.fn(),
  };
});

describe('Role Selector', () => {
  let state: StateType;
  let user: UserEvent;
  let mockData: InvestigationUser[] = [];
  const mockPushFilters = jest.fn();
  const mockStore = configureStore([thunk]);

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <RoleSelector />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
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
    (usePushFilter as jest.Mock).mockReturnValue(mockPushFilters);
    (parseSearchToQuery as jest.Mock).mockReturnValue({ filters: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches roles when rendered and displays them in dropdown', async () => {
    renderComponent();

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

    await user.click(
      await screen.findByRole('button', { name: 'my_data_table.role_selector' })
    );

    expect(
      await screen.findByRole('option', { name: 'my_data_table.all_roles' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', {
        name: mockData[0].role.toLowerCase(),
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: mockData[1].role })
    ).toBeInTheDocument();
  });

  it('updates filters when role is selected', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'my_data_table.role_selector' })
    );
    await user.click(await screen.findByRole('option', { name: 'pi' }));

    expect(mockPushFilters).toHaveBeenCalledWith('investigationUsers.role', {
      value: 'PI',
      type: 'include',
    });
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

    renderComponent();

    expect(await screen.findByText('experimenter')).toBeInTheDocument();
  });
});
