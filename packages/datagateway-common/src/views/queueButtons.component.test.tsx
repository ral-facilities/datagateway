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
import { DataCollection, Investigation } from '../app.types';
import * as parseTokens from '../parseTokens';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import {
  QueueDataCollectionButton,
  QueueVisitButton,
} from './queueButtons.component';

vi.mock('../handleICATError');

describe('Queue buttons', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;
  let investigation: Investigation;
  let dataCollection: DataCollection;
  let permissionResponse: boolean;

  beforeEach(() => {
    investigation = {
      id: 1,
      visitId: '1',
      title: 'Test',
      name: 'test',
    };
    dataCollection = {
      id: 2,
    };
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
      })
    );
    permissionResponse = true;

    axios.get = vi.fn().mockImplementation((url: string) => {
      if (/.*\/queue\/allowed$/.test(url)) {
        return Promise.resolve({
          data: permissionResponse,
        });
      }
      if (/.*\/downloadType\/status$/.test(url)) {
        return Promise.resolve({
          data: {
            https: {
              idsUrl: 'https://example.com/ids',
              disabled: false,
              message: '',
              displayName: 'HTTPS',
              description: '',
            },
          },
        });
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Queue Visit button', () => {
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

    it('renders correctly', async () => {
      renderComponent({
        investigation,
      });

      expect(
        await screen.findByRole('button', { name: 'buttons.queue_visit' })
      ).toBeInTheDocument();
    });

    it('renders no button if user does not have permission', async () => {
      permissionResponse = false;

      renderComponent({
        investigation,
      });

      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      expect(
        screen.queryByRole('button', { name: 'buttons.queue_visit' })
      ).not.toBeInTheDocument();
    });

    it('opens download confirm dialog when clicked & close when click close', async () => {
      renderComponent({
        investigation,
      });

      await user.click(
        await screen.findByRole('button', { name: 'buttons.queue_visit' })
      );

      const dialog = await screen.findByRole('dialog', {
        name: 'downloadConfirmDialog.dialog_title',
      });

      expect(dialog).toBeInTheDocument();

      await user.click(
        await screen.findByRole('button', {
          name: 'downloadConfirmDialog.close_arialabel',
        })
      );

      await waitForElementToBeRemoved(dialog);
    });
  });

  describe('Queue DataCollection button', () => {
    function renderComponent(
      props: React.ComponentProps<typeof QueueDataCollectionButton>
    ): RenderResult {
      const store = mockStore(state);
      return render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <QueueDataCollectionButton {...props} />
          </QueryClientProvider>
        </Provider>
      );
    }

    it('renders correctly', async () => {
      renderComponent({
        dataCollection,
        isClosed: false,
        totalSize: 12345,
      });

      expect(
        await screen.findByRole('button', {
          name: 'buttons.queue_data_collection',
        })
      ).toBeInTheDocument();
    });

    it('renders disabled button if user does not have permission', async () => {
      permissionResponse = false;

      renderComponent({
        dataCollection,
        isClosed: false,
      });

      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      const button = await screen.findByRole('button', {
        name: 'buttons.queue_data_collection',
      });

      expect(button).toBeDisabled();

      await user.hover(
        await screen.getByLabelText('buttons.unable_to_queue_tooltip')
      );

      expect(
        await screen.findByText('buttons.unable_to_queue_tooltip')
      ).toBeInTheDocument();
    });

    it('renders disabled button if data is closed', async () => {
      renderComponent({
        dataCollection,
        isClosed: true,
      });

      const button = await screen.findByRole('button', {
        name: 'buttons.queue_data_collection',
      });

      expect(button).toBeDisabled();

      await user.hover(
        await screen.getByLabelText('buttons.disallow_closed_tooltip')
      );

      expect(
        await screen.findByText('buttons.disallow_closed_tooltip')
      ).toBeInTheDocument();
    });

    it('renders disabled button if anon download is disallowed', async () => {
      state.dgcommon.features = { disableAnonDownload: true };
      state.dgcommon.anonUserName = 'anon';

      vi.spyOn(parseTokens, 'readSciGatewayToken').mockReturnValue({
        username: 'anon',
        sessionId: 'abcdef',
      });

      renderComponent({
        dataCollection,
        isClosed: false,
      });

      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      const button = await screen.findByRole('button', {
        name: 'buttons.queue_data_collection',
      });

      expect(button).toBeDisabled();

      await user.hover(
        await screen.getByLabelText('buttons.disallow_anon_tooltip')
      );

      expect(
        await screen.findByText('buttons.disallow_anon_tooltip')
      ).toBeInTheDocument();
    });
  });
});
