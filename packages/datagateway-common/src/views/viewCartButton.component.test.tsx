import React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import ViewCartButton, { CartProps } from './viewCartButton.component';
import { Badge } from '@mui/material';

describe('Generic cart button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let props: CartProps;

  const navigateToDownload = jest.fn();

  const createWrapper = (props: CartProps): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={new QueryClient()}>
            <ViewCartButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    props = {
      cartItems: [],
      navigateToDownload: navigateToDownload,
      cartAriaLabel: 'test aria-label',
    };

    state = JSON.parse(
      JSON.stringify({
        dgdataview: {}, //Dont need to fill, since not part of the test
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

  it('renders correctly', () => {
    const wrapper = shallow(<ViewCartButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the navigate to download plugin when the cart clicked', () => {
    const wrapper = createWrapper(props);

    wrapper.find('[aria-label="test aria-label"]').last().simulate('click');

    expect(navigateToDownload).toHaveBeenCalledTimes(1);
  });

  it('has cartItems', () => {
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
      cartAriaLabel: 'test aria-label',
    };
    const wrapper = createWrapper(props);

    expect(wrapper.find(Badge).props().badgeContent).toEqual(2);
  });
});
