import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { DataPublication } from '../app.types';
import { StateType } from '../state/app.types';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import PublishButton from './publishButton.component';

describe('Publish button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;
  let dataPublication: DataPublication;
  let queryClient: QueryClient;

  function renderComponent(
    props: React.ComponentProps<typeof PublishButton>
  ): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PublishButton {...props} />
        </QueryClientProvider>
      </Provider>
    );
  }

  beforeEach(() => {
    dataPublication = {
      id: 1,
      title: 'Test',
      pid: 'pid',
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
    queryClient = new QueryClient();

    axios.put = vi.fn().mockResolvedValue({
      data: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent({
      dataPublication,
    });

    expect(
      await screen.findByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    ).toBeInTheDocument();
  });

  it('opens publish confirm dialogue when clicked & close when click close', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderComponent({
      dataPublication,
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    );

    const dialogue = await screen.findByRole('dialog', {
      name: 'DOIPublishConfirmDialog.dialog_title',
    });

    expect(dialogue).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIPublishConfirmDialog.close_aria_label',
      })
    );

    await waitForElementToBeRemoved(dialogue);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('sends open data request and shows success dialogue', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderComponent({
      dataPublication,
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    );

    const dialogue = await screen.findByRole('dialog', {
      name: 'DOIPublishConfirmDialog.dialog_title',
    });

    expect(dialogue).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIPublishConfirmDialog.accept',
      })
    );

    expect(
      await screen.findByText('DOIPublishConfirmDialog.publish_success')
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIPublishConfirmDialog.close_aria_label',
      })
    );

    await waitForElementToBeRemoved(dialogue);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['dataPublication', dataPublication.id],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['doi', dataPublication.pid],
    });
  });

  it('sends open data request and shows error dialogue', async () => {
    const error = {
      message: 'Test error message',
      response: {
        status: 500,
      },
    };
    axios.put = vi.fn().mockRejectedValue(error);
    // easier to mock console than to mock handleDOIAPIError
    vi.spyOn(console, 'error').mockImplementation(() => {
      // void
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderComponent({
      dataPublication,
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'datapublications.publish.publish_label',
      })
    );

    const dialogue = await screen.findByRole('dialog', {
      name: 'DOIPublishConfirmDialog.dialog_title',
    });

    expect(dialogue).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIPublishConfirmDialog.accept',
      })
    );

    expect(
      await screen.findByText('DOIPublishConfirmDialog.publish_error')
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIPublishConfirmDialog.close_aria_label',
      })
    );

    await waitForElementToBeRemoved(dialogue);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
