import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import ViewButton, { ViewProps } from './viewButton.component';

describe('Generic view button', () => {
  const mockStore = configureStore([thunk]);
  const handleButtonChange = jest.fn();
  let user: UserEvent;
  let state: StateType;
  let props: ViewProps;

  function renderComponent(props: ViewProps): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              key: 'testKey',
              pathname: '/',
            },
          ]}
        >
          <QueryClientProvider client={new QueryClient()}>
            <ViewButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      viewCards: true,
      handleButtonChange: handleButtonChange,
      disabled: false,
    };
    state = JSON.parse(
      JSON.stringify({
        dgdataview: {},
        //Dont need to fill, since not part of the test
        dgcommon: {
          ...dGCommonInitialState,
          urls: {
            ...dGCommonInitialState.urls,
            idsUrl: 'https://www.example.com/ids',
          },
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    handleButtonChange.mockClear();
  });

  it('renders correctly', async () => {
    const { asFragment } = renderComponent(props);
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the handle button change when the view button is clicked', async () => {
    renderComponent(props);
    await user.click(
      await screen.findByRole('button', {
        name: 'page view app.view_table',
      })
    );
    expect(handleButtonChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop disabled is equal to true', async () => {
    props = {
      viewCards: true,
      handleButtonChange: handleButtonChange,
      disabled: true,
    };
    renderComponent(props);
    expect(
      await screen.findByRole('button', {
        name: 'page view app.view_table',
      })
    ).toBeDisabled();
  });
});
