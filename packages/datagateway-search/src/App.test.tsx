import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import log from 'loglevel';
import { render, screen, waitFor } from '@testing-library/react';
import { configureApp, settingsLoaded } from './state/actions';

jest.mock('loglevel').mock('./state/actions', () => ({
  ...jest.requireActual('./state/actions'),
  configureApp: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('shows loading screen when configuring app', async () => {
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
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
    jest
      .spyOn(window.localStorage.__proto__, 'removeItem')
      .mockImplementation(() => {
        throw new Error(error);
      });

    jest.spyOn(console, 'error').mockImplementation(() => {
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
