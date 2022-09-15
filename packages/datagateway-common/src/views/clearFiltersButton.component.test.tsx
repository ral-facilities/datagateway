import * as React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ClearFiltersButton, {
  ClearFilterProps,
} from './clearFiltersButton.component';
import { render, screen, type RenderResult } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Generic clear filters button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let props: ClearFilterProps;
  let user: UserEvent;

  const handleButtonClearFilters = jest.fn();

  const renderComponent = (props: ClearFilterProps): RenderResult => {
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
      handleButtonClearFilters,
      disabled: false,
    };

    user = userEvent.setup();
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
    const { asFragment } = renderComponent(props);
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the handle clear filter button when the button is clicked', async () => {
    renderComponent(props);

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );

    expect(handleButtonClearFilters).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop disabled is equal to true', async () => {
    renderComponent({
      handleButtonClearFilters: handleButtonClearFilters,
      disabled: true,
    });

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });
});
