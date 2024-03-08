import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { createDataset } from '../api';
import UploadDialog from './uploadDialog.component';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import dGCommonReducer from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';

// TODO: see if we can remove this
// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent } from '@testing-library/dom';

jest.mock('../api');

describe('Upload dialog component', () => {
  describe('Dataset', () => {
    let queryClient: QueryClient;

    const createWrapper = (): RenderResult =>
      render(
        <Provider
          store={createStore(
            combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
          )}
        >
          <QueryClientProvider client={queryClient}>
            <UploadDialog
              entityType="investigation"
              entityId={1}
              open={true}
              setClose={jest.fn()}
            />
          </QueryClientProvider>
        </Provider>
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

    it('calls createDataset with correct parameters when upload button is clicked', async () => {
      const createDatasetSpy = jest.fn();
      (createDataset as jest.Mock).mockImplementation(createDatasetSpy);

      createWrapper();
      const uploadButton = screen.getByRole('button', {
        name: 'upload',
      });

      await userEvent.type(
        screen.getByRole('textbox', { name: 'upload.name' }),
        'name'
      );
      await userEvent.type(
        screen.getByRole('textbox', { name: 'upload.description' }),
        'description'
      );
      await userEvent.click(uploadButton);

      await waitFor(() =>
        expect(createDatasetSpy).toHaveBeenCalledWith(
          undefined,
          'name',
          'description',
          expect.anything()
        )
      );
    });

    it('Closes dialog when cancel button is clicked', async () => {
      const closeFunction = jest.fn();

      render(
        <Provider
          store={createStore(
            combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
          )}
        >
          <QueryClientProvider client={queryClient}>
            <UploadDialog
              entityType="investigation"
              entityId={1}
              open={true}
              setClose={closeFunction}
            />
          </QueryClientProvider>
        </Provider>
      );

      await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(closeFunction).toHaveBeenCalled();
    });
  });

  describe('Datafile', () => {
    let queryClient: QueryClient;

    const createWrapper = (): RenderResult =>
      render(
        <Provider
          store={createStore(
            combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
          )}
        >
          <QueryClientProvider client={queryClient}>
            <UploadDialog
              entityType="datafile"
              entityId={1}
              open={true}
              setClose={jest.fn()}
            />
          </QueryClientProvider>
        </Provider>
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
        <Provider
          store={createStore(
            combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
          )}
        >
          <QueryClientProvider client={queryClient}>
            <UploadDialog
              entityType="datafile"
              entityId={1}
              open={true}
              setClose={closeFunction}
            />
          </QueryClientProvider>
        </Provider>
      );

      await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

      expect(closeFunction).toHaveBeenCalled();
    });
    it('Uppy dashboard does not allow upload of .xml files', async () => {
      const { getByLabelText, queryByText } = createWrapper();

      const fileInput = getByLabelText('Uppy Dashboard').querySelector(
        'input.uppy-Dashboard-input'
      ) as HTMLInputElement;

      // Create a fake .xml file
      const xmlFile = new File(['<xml>Some content</xml>'], 'test.xml', {
        type: 'application/xml',
      });

      // Trigger the file upload
      // await userEvent.upload(fileInput, xmlFile);
      fireEvent.change(fileInput, { target: { files: [xmlFile] } });

      await waitFor(() => {
        expect(queryByText('.xml files are not allowed')).toBeInTheDocument();
      });
    });

    it('Uppy dashboard allows upload of non .xml files', async () => {
      const { getByLabelText, queryByText } = createWrapper();

      const fileInput = getByLabelText('Uppy Dashboard').querySelector(
        'input.uppy-Dashboard-input'
      ) as HTMLInputElement;

      // Create a fake .txt file
      const xmlFile = new File(['Some content'], 'test.txt', {
        type: 'text/plain',
      });

      // Trigger the file upload
      // await userEvent.upload(fileInput, xmlFile);
      fireEvent.change(fileInput, { target: { files: [xmlFile] } });

      await waitFor(() => {
        expect(
          queryByText('.xml files are not allowed')
        ).not.toBeInTheDocument();
      });
    });
  });
});
