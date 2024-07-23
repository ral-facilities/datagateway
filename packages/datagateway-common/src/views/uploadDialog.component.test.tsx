import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import UploadDialog, {
  checkNameExists,
  beforeFileAdded,
  postProcessor,
} from './uploadDialog.component';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import dGCommonReducer from '../state/reducers/dgcommon.reducer';
import { StateType } from '../state/app.types';
import axios from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import Uppy, { UppyFile } from '@uppy/core';

// TODO: see if we can remove this
// eslint-disable-next-line import/no-extraneous-dependencies
// import { fireEvent } from '@testing-library/dom';

jest.mock('../api');

const createUppyInstance = (): Uppy => {
  // jest mock the uppy instance
  const uppy = new Uppy();
  uppy.info = jest.fn();
  uppy.getFiles = jest.fn().mockReturnValue([]);
  uppy.setFileState = jest.fn();
  return uppy;
};

const createUppyFile = (name: string): UppyFile => {
  // jest mock the uppy file
  const file = {
    id: 'test-id',
    name,
    type: 'text/plain',
    size: 100,
    meta: { name: name },
    data: { lastModified: 123456 },
  } as UppyFile;

  return file;
};

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
  });

  it('checks if datafile name exists in the dataset', async () => {
    const apiUrl = 'https://example.com/api';
    const name = 'test.txt';
    const datasetId = 1;

    const params = new URLSearchParams();
    params.append(
      'where',
      JSON.stringify({
        name: { eq: name },
      })
    );
    params.append(
      'where',
      JSON.stringify({
        'dataset.id': { eq: datasetId },
      })
    );

    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({});

    const result = await checkNameExists(apiUrl, name, 'datafile', datasetId);

    expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/datafiles/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    });
    expect(result).toBe(true);
  });

  it('returns false if datafile name does not exist in the dataset', async () => {
    const apiUrl = 'https://example.com/api';
    const name = 'test.txt';
    const datasetId = 1;

    const params = new URLSearchParams();
    params.append(
      'where',
      JSON.stringify({
        name: { eq: name },
      })
    );
    params.append(
      'where',
      JSON.stringify({
        'dataset.id': { eq: datasetId },
      })
    );

    const axiosGetSpy = jest.spyOn(axios, 'get');
    const mockError = {
      isAxiosError: true,
      response: { status: 404 },
    };
    axiosGetSpy.mockRejectedValueOnce(mockError);

    const result = await checkNameExists(apiUrl, name, 'datafile', datasetId);

    expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/datafiles/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    });
    expect(result).toBe(false);
  });

  it('throws an error if an unexpected error occurs', async () => {
    const apiUrl = 'https://example.com/api';
    const name = 'test.txt';
    const datasetId = 1;

    const params = new URLSearchParams();
    params.append(
      'where',
      JSON.stringify({
        name: { eq: name },
      })
    );
    params.append(
      'where',
      JSON.stringify({
        'dataset.id': { eq: datasetId },
      })
    );

    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockRejectedValueOnce(new Error('Unexpected error'));

    await expect(
      checkNameExists(apiUrl, name, 'datafile', datasetId)
    ).rejects.toThrowError('Unexpected error');

    expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/datafiles/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    });
  });

  it('checks if dataset name exists in the investigation', async () => {
    const apiUrl = 'https://example.com/api';
    const name = 'test';
    const investigationId = 1;

    const params = new URLSearchParams();
    params.append(
      'where',
      JSON.stringify({
        name: { eq: name },
      })
    );
    params.append(
      'where',
      JSON.stringify({
        'investigation.id': { eq: investigationId },
      })
    );

    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({});

    const result = await checkNameExists(
      apiUrl,
      name,
      'dataset',
      investigationId
    );

    expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/datasets/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    });
    expect(result).toBe(true);
  });

  it('checks if the file has a correct extension', () => {
    const uppy = createUppyInstance();

    // correct extension
    const file1 = createUppyFile('test.txt');

    expect(beforeFileAdded(uppy, file1)).toBe(true);
    expect(uppy.info).not.toHaveBeenCalled();

    // incorrect extension
    const file2 = createUppyFile('test.xml');

    expect(beforeFileAdded(uppy, file2)).toBe(false);
    expect(uppy.info).toHaveBeenCalledWith(
      '.xml files are not allowed',
      'error',
      5000
    );
  });

  it('checks if the file is a duplicate', () => {
    const uppy = createUppyInstance();
    const file1 = createUppyFile('test.txt');
    const file2 = createUppyFile('test.txt');

    uppy.getFiles = jest.fn().mockReturnValue([file1]);

    const result = beforeFileAdded(uppy, file2);

    expect(result).toBe(false);
    expect(uppy.info).toHaveBeenCalledWith(
      'File named "test.txt" is already in the upload queue',
      'error',
      5000
    );
  });

  it('checks if the file in the queue is a ghost', () => {
    const uppy = createUppyInstance();
    const file1 = createUppyFile('test.txt');
    const file2 = createUppyFile('test.txt');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file2 as any).isGhost = true;

    uppy.getFiles = jest.fn().mockReturnValue([file2]);

    const result = beforeFileAdded(uppy, file1);

    expect(result).toBe(true);
    expect(uppy.info).not.toHaveBeenCalled();
    expect(file2.size).toBe(0);
  });

  it('should post processes dataset upload', async () => {
    const file = createUppyFile('test.txt');
    file.meta = { name: 'test.txt' };
    file.response = {
      body: { id: 1 },
      status: 200,
      uploadURL: 'example.com/upload/123',
    };

    // simulate the failed file
    const file2 = createUppyFile('test2.txt');
    file2.meta = { name: 'test2.txt' };
    file2.response = undefined;

    const uppy = createUppyInstance();
    uppy.getFiles = jest.fn().mockReturnValue([file, file2]);

    const refObject = { current: null };

    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { datasetId: 123 } });

    const queryClient = new QueryClient();
    queryClient.invalidateQueries = jest.fn();

    await postProcessor(
      uppy,
      refObject,
      'investigation',
      'testName',
      'testDescription',
      1,
      'example.com',
      queryClient
    );

    // should only commit the successful file
    expect(axios.post).toHaveBeenCalledWith(
      'example.com/commit',
      {
        datafiles: [
          {
            name: 'test.txt',
            size: 100,
            lastModified: 123456,
            url: 'example.com/upload/123',
          },
        ],
        dataset: {
          datasetDescription: 'testDescription',
          datasetName: 'testName',
          investigationId: 1,
        },
      },
      { headers: { authorization: 'Bearer null' } }
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(['dataset']);
    expect(refObject.current).toBe(123);
  });

  it('should post processes datafile upload', async () => {
    const file = createUppyFile('test.txt');
    file.meta = { name: 'test.txt' };
    file.response = {
      body: { id: 1 },
      status: 200,
      uploadURL: 'example.com/upload/123',
    };

    // simulate the failed file
    const file2 = createUppyFile('test2.txt');
    file2.meta = { name: 'test2.txt' };
    file2.response = undefined;

    const uppy = createUppyInstance();
    uppy.getFiles = jest.fn().mockReturnValue([file, file2]);

    const refObject = { current: 123 };

    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { datasetId: 123 } });

    const queryClient = new QueryClient();
    queryClient.invalidateQueries = jest.fn();

    await postProcessor(
      uppy,
      refObject,
      'datafile',
      'testName',
      'testDescription',
      123,
      'example.com',
      queryClient
    );

    // should only commit the successful file
    expect(axios.post).toHaveBeenCalledWith(
      'example.com/commit',
      {
        datafiles: [
          {
            datasetId: 123,
            name: 'test.txt',
            size: 100,
            lastModified: 123456,
            url: 'example.com/upload/123',
          },
        ],
      },
      { headers: { authorization: 'Bearer null' } }
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(['datafile']);
    expect(refObject.current).toBe(123);
  });

  it('should not commit if no files are successful', async () => {
    const file = createUppyFile('test.txt');
    file.meta = { name: 'test.txt' };
    file.response = undefined;

    const uppy = createUppyInstance();
    uppy.getFiles = jest.fn().mockReturnValue([file]);

    const refObject = { current: null };

    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { datasetId: 123 } });

    const queryClient = new QueryClient();
    queryClient.invalidateQueries = jest.fn();

    await postProcessor(
      uppy,
      refObject,
      'investigation',
      'testName',
      'testDescription',
      1,
      'example.com',
      queryClient
    );

    expect(axios.post).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    expect(refObject.current).toBe(null);
  });
});
