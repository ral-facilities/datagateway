import * as React from 'react';
import DownloadButton, {
  DownloadButtonProps,
} from './downloadButton.component';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import {
  downloadDatafile,
  downloadDataset,
  downloadInvestigation,
} from '../api';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('../api/datafiles');
jest.mock('../api/datasets');
jest.mock('../api/investigations');

describe('Generic download button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: UserEvent;

  function renderComponent(props: DownloadButtonProps): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <DownloadButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
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
  });

  describe('text variant', () => {
    it('renders correctly', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
      });

      expect(
        await screen.findByRole('button', { name: 'buttons.download' })
      ).toBeInTheDocument();
    });

    it('calls download investigation on button press', async () => {
      renderComponent({
        entityType: 'investigation',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
      });

      await user.click(
        await screen.findByRole('button', { name: 'buttons.download' })
      );

      expect(downloadInvestigation).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('calls download dataset on button press', async () => {
      renderComponent({
        entityType: 'dataset',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
      });

      await user.click(
        await screen.findByRole('button', { name: 'buttons.download' })
      );

      expect(downloadDataset).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('calls download datafile on button press', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
      });

      await user.click(
        await screen.findByRole('button', { name: 'buttons.download' })
      );

      expect(downloadDatafile).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('renders a tooltip and disabled button if entity size is zero', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 0,
      });

      const button = await screen.findByRole('button', {
        name: 'buttons.download',
      });

      expect(button).toBeDisabled();

      await user.hover(button.parentElement);
      expect(
        await screen.findByText('buttons.unable_to_download_tooltip')
      ).toBeInTheDocument();
    });
  });

  describe('icon variant', () => {
    it('renders icon variant correctly', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
        variant: 'icon',
      });

      expect(await screen.findByTestId('GetAppIcon')).toBeInTheDocument();
    });

    it('calls download investigation on button press', async () => {
      renderComponent({
        entityType: 'investigation',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
        variant: 'icon',
      });

      await user.click(await screen.findByTestId('GetAppIcon'));

      expect(downloadInvestigation).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('calls download dataset on button press', async () => {
      renderComponent({
        entityType: 'dataset',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
        variant: 'icon',
      });

      await user.click(await screen.findByTestId('GetAppIcon'));

      expect(downloadDataset).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('calls download datafile on button press', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 1,
        variant: 'icon',
      });

      await user.click(await screen.findByTestId('GetAppIcon'));

      expect(downloadDatafile).toHaveBeenCalledWith(
        'https://www.example.com/ids',
        1,
        'test'
      );
    });

    it('renders a tooltip and disabled button if entity size is zero', async () => {
      renderComponent({
        entityType: 'datafile',
        entityName: 'test',
        entityId: 1,
        entitySize: 0,
        variant: 'icon',
      });

      const button = await screen.findByRole('button', {
        name: 'buttons.download',
      });

      expect(button).toBeDisabled();

      await user.hover(button.parentElement);
      expect(
        await screen.findByText('buttons.unable_to_download_tooltip')
      ).toBeInTheDocument();
    });
  });

  it('renders nothing when entityName is undefined', async () => {
    renderComponent({
      entityType: 'datafile',
      entityName: undefined,
      entityId: 1,
      entitySize: 1,
    });

    await waitFor(() => {
      expect(screen.queryByRole('button')).toBeNull();
    });
  });
});
