import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import ClearFiltersButton, {
  ClearFilterProps,
} from './clearFiltersButton.component';

describe('Generic clear filters button', () => {
  let mount;
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

  beforeEach(() => {
    mount = createMount();

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
    mount.cleanUp();
    jest.clearAllMocks();
    handleButtonClearFilters.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper(props);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the handle clear filter button when the button is clicked', () => {
    const wrapper = createWrapper(props);

    wrapper
      .find('[data-testid="clear-filters-button"]')
      .first()
      .simulate('click');

    expect(handleButtonClearFilters).toHaveBeenCalledTimes(1);
  });

  it(' is disabled when prop disabled is equal to true', () => {
    props = {
      handleButtonClearFilters: handleButtonClearFilters,
      disabled: true,
    };
    const wrapper = createWrapper(props);

    expect(wrapper.find(ClearFiltersButton).props().disabled).toEqual(true);
  });
});
