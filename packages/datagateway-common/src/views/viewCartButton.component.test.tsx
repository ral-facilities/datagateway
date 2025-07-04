import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import ViewCartButton, { CartProps } from './viewCartButton.component';

describe('Generic cart button', () => {
  const mockStore = configureStore([thunk]);
  const navigateToDownload = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;
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
    vi.clearAllMocks();
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
