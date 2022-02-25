import React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { mount, ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import ViewButton, { ViewProps } from './viewButton.component';
import { render, RenderResult } from '@testing-library/react';

describe('Generic view button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let props: ViewProps;

  const handleButtonChange = jest.fn();

  const createWrapper = (props: ViewProps): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={new QueryClient()}>
            <ViewButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  const createRTLWrapper = (props: ViewProps): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={new QueryClient()}>
            <ViewButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    props = {
      viewCards: true,
      handleButtonChange: handleButtonChange,
      disabled: false,
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
    handleButtonChange.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = createRTLWrapper(props);
    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('calls the handle button change when the view button is clicked', () => {
    const wrapper = createWrapper(props);

    wrapper
      .find('[aria-label="page view app.view_table"]')
      .last()
      .simulate('click');

    expect(handleButtonChange).toHaveBeenCalledTimes(1);

    wrapper.update();

    expect(
      wrapper.find('[aria-label="page view app.view_cards"]')
    ).toBeTruthy();

    wrapper
      .find('[aria-label="page view app.view_table"]')
      .last()
      .simulate('click');

    expect(handleButtonChange).toHaveBeenCalledTimes(2);

    expect(
      wrapper.find('[aria-label="page view app.view_cards"]')
    ).toBeTruthy();
  });

  it('is disabled when prop disabled is equal to true', () => {
    props = {
      viewCards: true,
      handleButtonChange: handleButtonChange,
      disabled: true,
    };
    const wrapper = createWrapper(props);

    expect(wrapper.find(ViewButton).props().disabled).toEqual(true);
  });
});
