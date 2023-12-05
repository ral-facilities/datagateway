import * as React from 'react';
import UploadButton, { UploadButtonProps } from './uploadButton.component';
import configureStore from 'redux-mock-store';
import { initialState as dGCommonInitialState } from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, type RenderResult, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('../api/datafiles');
jest.mock('../api/datasets');
jest.mock('../api/investigations');

describe('Generic upload button', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: UserEvent;

  function renderComponent(props: UploadButtonProps): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <UploadButton {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    user = userEvent.setup();
    state = JSON.parse(
      JSON.stringify({
        dgdataview: {},
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
    it('renders correctly dataset', async () => {
      renderComponent({
        entityType: 'dataset',
        entityId: 1,
        variant: 'text',
      });
      expect(
        await screen.findByRole('button', { name: 'buttons.upload_datafile' })
      ).toBeInTheDocument();
      expect(await screen.findByText('Upload Datafile')).toBeInTheDocument();
    });

    it('renders correctly investigation', async () => {
      renderComponent({
        entityType: 'investigation',
        entityId: 1,
        variant: 'text',
      });
      expect(
        await screen.findByRole('button', { name: 'buttons.upload_dataset' })
      ).toBeInTheDocument();
      expect(await screen.findByText('Upload Dataset')).toBeInTheDocument();
    });

    it('opens upload dialog when clicked', async () => {
      renderComponent({
        entityType: 'dataset',
        entityId: 1,
        variant: 'text',
      });

      const uploadButton = await screen.findByRole('button', {
        name: 'buttons.upload_datafile',
      });

      // Trigger the onClick handler directly
      uploadButton.click();

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('renders a tooltip when hovered', async () => {
      renderComponent({
        entityType: 'dataset',
        entityId: 1,
        variant: 'text',
      });

      await user.hover(
        await screen.findByRole('button', {
          name: 'buttons.upload_datafile',
        })
      );

      expect(
        await screen.findByRole('tooltip', { name: 'buttons.upload_datafile' })
      ).toBeInTheDocument();
    });
  });

  describe('full text variant', () => {
    it('renders correctly', async () => {
      renderComponent({
        entityType: 'datafile',
        entityId: 1,
        variant: 'text',
      });
      expect(
        await screen.findByRole('button', { name: 'buttons.upload_datafile' })
      ).toBeInTheDocument();
      expect(
        await screen.findByText('buttons.upload_datafile')
      ).toBeInTheDocument();
    });

    it('opens upload dialog when clicked', async () => {
      renderComponent({
        entityType: 'datafile',
        entityId: 1,
        variant: 'text',
      });

      const uploadButton = await screen.findByRole('button', {
        name: 'buttons.upload_datafile',
      });

      // Trigger the onClick handler directly
      uploadButton.click();

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('renders a tooltip when hovered', async () => {
      renderComponent({
        entityType: 'datafile',
        entityId: 1,
        variant: 'text',
      });

      await user.hover(
        await screen.findByRole('button', {
          name: 'buttons.upload_datafile',
        })
      );

      expect(
        await screen.findByRole('tooltip', { name: 'buttons.upload_datafile' })
      ).toBeInTheDocument();
    });
  });

  describe('icon variant', () => {
    it('renders correctly', async () => {
      renderComponent({
        entityType: 'dataset',
        entityId: 1,
        variant: 'icon',
      });

      expect(
        await screen.findByRole('button', { name: 'buttons.upload_datafile' })
      ).toBeInTheDocument();

      // The text should not be rendered
      expect(
        screen.queryByText('buttons.upload_datafile')
      ).not.toBeInTheDocument();
    });

    it('opens upload dialog when clicked', async () => {
      renderComponent({
        entityType: 'dataset',
        entityId: 1,
        variant: 'icon',
      });

      const uploadButton = await screen.findByRole('button', {
        name: 'buttons.upload_datafile',
      });

      // Trigger the onClick handler directly
      uploadButton.click();

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('renders a tooltip when hovered', async () => {
      renderComponent({
        entityType: 'investigation',
        entityId: 1,
        variant: 'icon',
      });

      await user.hover(
        await screen.findByRole('button', {
          name: 'buttons.upload_dataset',
        })
      );

      expect(
        await screen.findByRole('tooltip', { name: 'buttons.upload_dataset' })
      ).toBeInTheDocument();
    });
  });
});
