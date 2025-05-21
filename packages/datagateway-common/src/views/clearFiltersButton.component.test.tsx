import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import ClearFiltersButton, {
  ClearFilterProps,
} from './clearFiltersButton.component';

describe('Generic clear filters button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let props: ClearFilterProps;
  let user: ReturnType<typeof userEvent.setup>;

  const handleButtonClearFilters = vi.fn();

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
    vi.clearAllMocks();
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
      handleButtonClearFilters,
      disabled: true,
    });

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });
});
