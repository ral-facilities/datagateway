import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import type { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewButton from './viewButton.component';

describe('Generic view button', () => {
  let state: StateType;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <Provider store={configureStore([thunk])(state)}>
        <MemoryRouter
          initialEntries={[
            {
              key: 'testKey',
              pathname: '/',
            },
          ]}
        >
          <QueryClientProvider client={new QueryClient()}>
            {children}
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    state = JSON.parse(
      JSON.stringify({
        dgdataview: {},
        //Dont need to fill, since not part of the test
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

  it('displays as view table when card view is enabled', async () => {
    render(<ViewButton viewCards handleButtonChange={vi.fn()} />, {
      wrapper: Wrapper,
    });

    const button = screen.getByRole('button', {
      name: 'page view app.view_table',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('app.view_table');
    expect(screen.getByTestId('ViewListIcon')).toBeInTheDocument();
  });

  it('displays as view cards when card view is disabled', () => {
    render(<ViewButton viewCards={false} handleButtonChange={vi.fn()} />, {
      wrapper: Wrapper,
    });

    const button = screen.getByRole('button', {
      name: 'page view app.view_cards',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('app.view_cards');
    expect(screen.getByTestId('ViewAgendaIcon')).toBeInTheDocument();
  });

  it('calls the handle button change when the view button is clicked', async () => {
    const user = userEvent.setup();
    const handleButtonChange = vi.fn();

    render(<ViewButton viewCards handleButtonChange={handleButtonChange} />, {
      wrapper: Wrapper,
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'page view app.view_table',
      })
    );
    expect(handleButtonChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop disabled is equal to true', async () => {
    const user = userEvent.setup();
    const handleButtonChange = vi.fn();

    render(
      <ViewButton viewCards disabled handleButtonChange={handleButtonChange} />,
      {
        wrapper: Wrapper,
      }
    );

    const button = screen.getByRole('button', {
      name: 'page view app.view_table',
    });

    expect(button).toBeDisabled();
    await expect(user.click(button)).rejects.toThrowError();
    expect(handleButtonChange).not.toBeCalled();
  });
});
