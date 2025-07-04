import App from './App';
import log from 'loglevel';
import { render, screen, waitFor } from '@testing-library/react';
import { configureApp, settingsLoaded } from './state/actions';

vi.mock('loglevel');
vi.mock('./state/actions', async () => {
  const originalModule = await vi.importActual('./state/actions');

  return { ...originalModule, configureApp: vi.fn() };
});

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // pretend app is configured successfully
    vi.mocked(configureApp).mockReturnValue(async (dispatch) => {
      dispatch(settingsLoaded());
    });
  });

  it('renders without crashing', async () => {
    const { unmount } = render(<App />);

    expect(await screen.findByText('Search data')).toBeInTheDocument();

    unmount();
  });

  it('shows loading screen when configuring app', async () => {
    vi.mocked(configureApp).mockReturnValue(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the app is still being configured
        })
    );

    render(<App />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('page')).toBeNull();
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    const error = 'test SearchPageContainer error';

    // throw an error in function used by searchPageContainer
    vi.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation(
      () => {
        throw new Error(error);
      }
    );

    vi.spyOn(console, 'error').mockImplementation(() => {
      // suppress console error
    });

    render(<App />);

    await waitFor(() => {
      // check that the error is logged
      expect(log.error).toHaveBeenCalledWith(
        `datagateway_search failed with error: Error: ${error}`
      );
    });

    // check that fallback UI is shown
    expect(await screen.findByText('app.error')).toBeInTheDocument();
  });
});
