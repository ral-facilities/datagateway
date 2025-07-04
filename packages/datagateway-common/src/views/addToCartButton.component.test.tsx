import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { DownloadCartItem } from '../app.types';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import AddToCartButton, {
  AddToCartButtonProps,
} from './addToCartButton.component';

vi.mock('../handleICATError');

describe('Generic add to cart button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;
  let holder: HTMLElement;
  let cartItems: DownloadCartItem[];

  function renderComponent(props: AddToCartButtonProps): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider
            client={
              new QueryClient({
                // silence react-query errors
                logger: {
                  log: console.log,
                  warn: console.warn,
                  error: vi.fn(),
                },
              })
            }
          >
            <AddToCartButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    cartItems = [];
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgdataview: {}, //Dont need to fill, since not part of the test
        dgcommon: {
          ...dGCommonInitialState,
        },
      })
    );

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*$/.test(url)) {
          return Promise.resolve({
            data: { cartItems },
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    axios.post = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*\/cartItems/.test(url)) {
          return Promise.resolve({
            data: [],
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    document.body.removeChild(holder);
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });

    expect(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
  });

  it('renders as disabled when cart is loading', async () => {
    axios.get = vi.fn().mockReturnValue(
      new Promise((_) => {
        // never resolve the promise to pretend the query is loading
      })
    );

    renderComponent({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });

    const addToCartButton = await screen.findByRole('button', {
      name: 'buttons.add_to_cart',
    });

    expect(addToCartButton).toBeDisabled();

    await user.hover(addToCartButton.parentElement);

    expect(
      await screen.findByText('buttons.cart_loading_tooltip')
    ).toBeInTheDocument();
  });

  it('renders as disabled with tooltip when cart does not load', async () => {
    axios.get = vi.fn().mockRejectedValue({
      message: 'Test error message',
    });

    renderComponent({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });

    const addToCartButton = await screen.findByRole('button', {
      name: 'buttons.add_to_cart',
    });

    expect(addToCartButton).toBeDisabled();

    await user.hover(addToCartButton.parentElement);

    expect(
      await screen.findByText('buttons.cart_loading_failed_tooltip')
    ).toBeInTheDocument();
  });

  it('renders as disabled with tooltip when parent entity selected', async () => {
    cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    renderComponent({
      allIds: [1, 2],
      entityId: 2,
      entityType: 'dataset',
      parentId: '1',
    });

    const removeFromCartButton = await screen.findByRole('button', {
      name: 'buttons.remove_from_cart',
    });

    expect(removeFromCartButton).toBeDisabled();

    await user.hover(removeFromCartButton.parentElement);

    expect(
      await screen.findByText('buttons.parent_selected_tooltip')
    ).toBeInTheDocument();
  });

  it('calls addToCart action on button press with item not in cart', async () => {
    renderComponent({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });

    // wait for data to finish loading
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'buttons.add_to_cart' })
      ).not.toBeDisabled();
    });

    axios.post = vi.fn().mockResolvedValue({
      data: {
        cartItems: [
          {
            entityType: 'investigation',
            entityId: 1,
          },
        ],
      },
    });

    await user.click(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    );

    expect(
      await screen.findByRole('button', { name: 'buttons.remove_from_cart' })
    ).toBeInTheDocument();
  });

  it('calls removeFromCart on button press with item already in cart', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        cartItems: [
          {
            entityId: 1,
            entityType: 'investigation',
            id: 1,
            name: 'test',
            parentEntities: [],
          },
        ],
      },
    });

    renderComponent({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });

    expect(
      await screen.findByRole('button', { name: 'buttons.remove_from_cart' })
    ).toBeInTheDocument();

    axios.post = vi.fn().mockResolvedValue({
      data: {
        cartItems: [],
      },
    });

    await user.click(
      screen.getByRole('button', { name: 'buttons.remove_from_cart' })
    );

    expect(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
  });
});
