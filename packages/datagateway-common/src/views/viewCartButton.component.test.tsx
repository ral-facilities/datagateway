import { render, type RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ViewCartButton, { CartProps } from './viewCartButton.component';

describe('Generic cart button', () => {
  const mockStore = configureStore([thunk]);
  const navigateToDownload = jest.fn();
  let user: UserEvent;
  let state: StateType;
  let props: CartProps;

  function renderComponent(props: CartProps): RenderResult {
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
            <ViewCartButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      cartItems: [],
      navigateToDownload: navigateToDownload,
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
    navigateToDownload.mockClear();
  });

  it('renders correctly', async () => {
    const { asFragment } = render(<ViewCartButton {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the navigate to download plugin when the cart clicked', async () => {
    renderComponent(props);
    await user.click(await screen.findByLabelText('app.cart_arialabel'));
    expect(navigateToDownload).toHaveBeenCalledTimes(1);
  });

  it('has cartItems', async () => {
    props = {
      cartItems: [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
        {
          entityId: 2,
          entityType: 'investigation',
          id: 2,
          name: 'tes2',
          parentEntities: [],
        },
      ],
      navigateToDownload: navigateToDownload,
    };
    renderComponent(props);
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
