import * as React from 'react';
import App from './App';
import log from 'loglevel';
import { render, screen, waitFor } from '@testing-library/react';
import PageContainer from './page/pageContainer.component';
import { configureApp, settingsLoaded } from './state/actions';

vi.mock('loglevel');
vi.mock('./page/pageContainer.component');
vi.mock('./state/actions', async () => {
  const originalModule = await vi.importActual('./state/actions');

  return { ...originalModule, configureApp: vi.fn() };
});
vi.mock('react', async () => {
  const originalModule = await vi.importActual('react');

  return {
    ...originalModule,
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    // pretend app is configured successfully
    vi.mocked(configureApp).mockReturnValue(async (dispatch) => {
      dispatch(settingsLoaded());
    });
    vi.mocked(PageContainer).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('page')).toBeInTheDocument();
  });

  it('shows loading screen when configuring app', async () => {
    vi.mocked(configureApp).mockReturnValue(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the app is still being configured
        })
    );
    vi.mocked(PageContainer).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('page')).toBeNull();
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    // pretend app is configured successfully
    vi.mocked(configureApp).mockReturnValue(async (dispatch) => {
      dispatch(settingsLoaded());
    });
    // pretend PageContainer throw an error and see if <App /> will catch the error
    vi.mocked(PageContainer).mockImplementation(() => {
      throw new Error('test PageContainer error');
    });

    vi.spyOn(console, 'error').mockImplementation(() => {
      // suppress console error
    });

    render(<App />);

    await waitFor(() => {
      // check that the error is logged
      expect(log.error).toHaveBeenCalled();
    });

    // check that fallback UI is shown
    expect(await screen.findByText('app.error')).toBeInTheDocument();
  });
});
