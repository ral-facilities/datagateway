import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { createDataset } from '../api';
import UploadDialog from './uploadDialog.component';

jest.mock('../api');

describe('Upload dialog component', () => {
  describe('Dataset', () => {
    let queryClient: QueryClient;

    const createWrapper = (): RenderResult =>
      render(
        <QueryClientProvider client={queryClient}>
          <UploadDialog
            entityType="investigation"
            entityId={1}
            open={true}
            setClose={jest.fn()}
          />
        </QueryClientProvider>
      );

    beforeEach(() => {
      queryClient = new QueryClient();
      setLogger({
        log: console.log,
        warn: console.warn,
        error: () => undefined,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders correctly', () => {
      const { asFragment } = createWrapper();
      expect(asFragment()).toMatchSnapshot();
    });

    it('renders a cancel and upload buttons', () => {
      createWrapper();
      expect(
        screen.getByRole('button', { name: 'cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'upload' })
      ).toBeInTheDocument();
    });

    it('renders a name and description text field', () => {
      createWrapper();
      expect(
        screen.getByRole('textbox', { name: 'upload.name' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('textbox', { name: 'upload.description' })
      ).toBeInTheDocument();
    });

    it('renders a file upload dashboard', () => {
      createWrapper();
      expect(screen.getByLabelText('Uppy Dashboard')).toBeInTheDocument();
    });

    it('calls createDataset when upload button is clicked', async () => {
      const createDatasetSpy = jest.fn();
      (createDataset as jest.Mock).mockImplementation(createDatasetSpy);

      createWrapper();
      const uploadButton = screen.getByRole('button', {
        name: 'upload',
      });
      await userEvent.click(uploadButton);

      await waitFor(() => expect(createDatasetSpy).toHaveBeenCalled());
    });

    it('Closes dialog when cancel button is clicked', async () => {
      const closeFunction = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <UploadDialog
            entityType="investigation"
            entityId={1}
            open={true}
            setClose={closeFunction}
          />
        </QueryClientProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(closeFunction).toHaveBeenCalled();
    });
  });

  describe('Datafile', () => {
    let queryClient: QueryClient;

    const createWrapper = (): RenderResult =>
      render(
        <QueryClientProvider client={queryClient}>
          <UploadDialog
            entityType="datafile"
            entityId={1}
            open={true}
            setClose={jest.fn()}
          />
        </QueryClientProvider>
      );

    beforeEach(() => {
      queryClient = new QueryClient();
      setLogger({
        log: console.log,
        warn: console.warn,
        error: () => undefined,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders correctly', () => {
      const { asFragment } = createWrapper();
      expect(asFragment()).toMatchSnapshot();
    });

    it('renders a cancel and upload buttons', () => {
      createWrapper();
      expect(
        screen.getByRole('button', { name: 'cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'upload' })
      ).toBeInTheDocument();
    });

    it("doesn't render a name and description text field", () => {
      createWrapper();
      expect(
        screen.queryByRole('textbox', { name: 'upload.name' })
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('textbox', { name: 'upload.description' })
      ).not.toBeInTheDocument();
    });

    it('renders a file upload dashboard', () => {
      createWrapper();
      expect(screen.getByLabelText('Uppy Dashboard')).toBeInTheDocument();
    });

    it("doesn't call createDataset when upload button is clicked", async () => {
      const createDatasetSpy = jest.fn();
      (createDataset as jest.Mock).mockImplementation(createDatasetSpy);

      createWrapper();
      const uploadButton = screen.getByRole('button', {
        name: 'upload',
      });
      await userEvent.click(uploadButton);

      await waitFor(() => expect(createDatasetSpy).not.toHaveBeenCalled());
    });

    it('Closes dialog when cancel button is clicked', async () => {
      const closeFunction = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <UploadDialog
            entityType="datafile"
            entityId={1}
            open={true}
            setClose={closeFunction}
          />
        </QueryClientProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(closeFunction).toHaveBeenCalled();
    });
  });
});
