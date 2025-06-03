import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Investigation } from '../app.types';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import QueueVisitButton from './queueVisitButton.component';

jest.mock('../handleICATError');

describe('Generic add to cart button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;
  let investigation: Investigation;

  function renderComponent(
    props: React.ComponentProps<typeof QueueVisitButton>
  ): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <QueueVisitButton {...props} />
        </QueryClientProvider>
      </Provider>
    );
  }

  beforeEach(() => {
    investigation = {
      id: 1,
      visitId: '1',
      title: 'Test',
      name: 'test',
    };
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgcommon: {
          ...dGCommonInitialState,
          accessMethods: {
            https: { idsUrl: 'https://example.com/ids' },
          },
        },
      })
    );

    axios.get = jest.fn().mockResolvedValue({
      data: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent({
      investigation,
    });

    expect(
      await screen.findByRole('button', { name: 'buttons.queue_visit' })
    ).toBeInTheDocument();
  });

  it('renders no button if user does not have permission', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: false,
    });

    renderComponent({
      investigation,
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(
      screen.queryByRole('button', { name: 'buttons.queue_visit' })
    ).not.toBeInTheDocument();
  });

  it('logs error if access methods not provided', async () => {
    state.dgcommon.accessMethods = undefined;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    renderComponent({
      investigation,
    });

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        'Access methods not provided but using QueueVisitButton - please provide access methods in the settings'
      )
    );
  });

  it('opens download confirm dialogue when clicked & close when click close', async () => {
    renderComponent({
      investigation,
    });

    await user.click(
      await screen.findByRole('button', { name: 'buttons.queue_visit' })
    );

    const dialogue = await screen.findByRole('dialog', {
      name: 'downloadConfirmDialog.dialog_title',
    });

    expect(dialogue).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.close_arialabel',
      })
    );

    await waitForElementToBeRemoved(dialogue);
  });
});
