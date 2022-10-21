import * as React from 'react';
import App from './App';
import * as log from 'loglevel';
import { render, screen, waitFor } from '@testing-library/react';
import PageContainer from './page/pageContainer.component';
import { configureApp, settingsLoaded } from './state/actions';

jest
  .mock('loglevel')
  .mock('./page/pageContainer.component')
  .mock('./state/actions', () => ({
    ...jest.requireActual('./state/actions'),
    configureApp: jest.fn(),
  }))
  .mock('react', () => ({
    ...jest.requireActual('react'),
    // skip React suspense mechanism and show children directly.
    Suspense: ({ children }) => children,
  }));

describe('App', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
    (PageContainer as jest.Mock).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('page')).toBeInTheDocument();
  });

  it('shows loading screen when configuring app', async () => {
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the app is still being configured
        })
    );
    (PageContainer as jest.Mock).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('page')).toBeNull();
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
    // pretend PageContainer throw an error and see if <App /> will catch the error
    (PageContainer as jest.Mock).mockImplementation(() => {
      throw new Error('test PageContainer error');
    });

    jest.spyOn(console, 'error').mockImplementation(() => {
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
