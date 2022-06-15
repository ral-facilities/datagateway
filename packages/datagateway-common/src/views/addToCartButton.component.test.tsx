import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import AddToCartButton, {
  AddToCartButtonProps,
} from './addToCartButton.component';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { useCart, useAddToCart, useRemoveFromCart } from '../api/cart';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

jest.mock('../api/cart', () => {
  const originalModule = jest.requireActual('../api/cart');

  return {
    __esModule: true,
    ...originalModule,
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
  };
});

describe('Generic add to cart button', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;

  const createWrapper = (props: AddToCartButtonProps): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <AddToCartButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: {}, //Dont need to fill, since not part of the test
        dgcommon: {
          ...dGCommonInitialState,
        },
      })
    );

    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });
    expect(wrapper.find('button').text()).toBe('buttons.add_to_cart');
  });

  it('renders as disabled when cart is loading', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const wrapper = createWrapper({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });
    expect(wrapper.find('button').prop('disabled')).toBe(true);
    expect(wrapper.find('StyledTooltip').prop('title')).toEqual('');
  });

  it('renders as disabled with tooltip when cart does not load', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: undefined,
    });
    const wrapper = createWrapper({
      allIds: [1],
      entityId: 1,
      entityType: 'investigation',
    });
    expect(wrapper.find('button').prop('disabled')).toBe(true);
    expect(wrapper.find('StyledTooltip').prop('title')).not.toEqual('');
  });

  it('calls addToCart action on button press with item not in cart', () => {
    const entityType = 'investigation';
    const wrapper = createWrapper({
      allIds: [1],
      entityId: 1,
      entityType,
    });

    wrapper.find('#add-to-cart-btn-investigation-1').first().simulate('click');

    expect(useAddToCart).toHaveBeenCalledWith(entityType);
  });

  it('calls removeFromCart on button press with item already in cart', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
    });

    const entityType = 'investigation';
    const wrapper = createWrapper({
      allIds: [1],
      entityId: 1,
      entityType,
    });

    wrapper
      .find('#remove-from-cart-btn-investigation-1')
      .first()
      .simulate('click');
    expect(useRemoveFromCart).toHaveBeenCalledWith(entityType);
  });
});
