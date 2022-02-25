import React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { mount, ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import ClearFiltersButton, {
  ClearFilterProps,
} from './clearFiltersButton.component';
import { render, RenderResult } from '@testing-library/react';

describe('Generic clear filters button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let props: ClearFilterProps;

  const handleButtonClearFilters = jest.fn();

  const createWrapper = (props: ClearFilterProps): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={new QueryClient()}>
            <ClearFiltersButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  const createRTLWrapper = (props: ClearFilterProps): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={new QueryClient()}>
            <ClearFiltersButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    props = {
      handleButtonClearFilters: handleButtonClearFilters,
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
    handleButtonClearFilters.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = createRTLWrapper(props);
    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('calls the handle clear filter button when the button is clicked', () => {
    const wrapper = createWrapper(props);

    wrapper
      .find('[data-testid="clear-filters-button"]')
      .last()
      .simulate('click');

    expect(handleButtonClearFilters).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop disabled is equal to true', () => {
    props = {
      handleButtonClearFilters: handleButtonClearFilters,
      disabled: true,
    };
    const wrapper = createWrapper(props);

    expect(wrapper.find(ClearFiltersButton).props().disabled).toEqual(true);
  });
});
