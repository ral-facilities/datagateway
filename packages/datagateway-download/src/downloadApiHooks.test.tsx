import axios from 'axios';
import * as React from 'react';
import type { Download, FormattedDownload } from 'datagateway-common';
import { DownloadCartItem, handleICATError } from 'datagateway-common';
import {
  useCart,
  useDatafileCounts,
  useDownloadDeleted,
  useDownloads,
  useIsTwoLevel,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
  useSizes,
} from './downloadApiHooks';
import { renderHook, WrapperComponent } from '@testing-library/react-hooks';
import { createMemoryHistory } from 'history';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from './ConfigProvider';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
    retryICATErrors: jest.fn().mockReturnValue(false),
  };
});

// Create our mocked datagateway-download mockedSettings file.
const mockedSettings = {
  facilityName: 'LILS',
  apiUrl: 'https://example.com/api',
  downloadApiUrl: 'https://example.com/downloadApi',
  idsUrl: 'https://example.com/ids',
  fileCountMax: 5000,
  totalSizeMax: 1000000000000,
  accessMethods: {
    https: {
      idsUrl: 'https://example.com/ids',
      displayName: 'HTTPS',
      description: 'Example description for HTTPS access method.',
    },
    globus: {
      idsUrl: 'https://example.com/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

// silence react-query errors
setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createReactQueryWrapper = (): WrapperComponent<unknown> => {
  const testQueryClient = createTestQueryClient();
  const history = createMemoryHistory();

  const wrapper: WrapperComponent<unknown> = ({ children }) => (
    <DownloadSettingsContext.Provider value={mockedSettings}>
      <Router history={history}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </Router>
    </DownloadSettingsContext.Provider>
  );
  return wrapper;
};

describe('Download Cart API react-query hooks test', () => {
  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
  });

  describe('useCart', () => {
    it('sends axios request to fetch cart and returns successful response', async () => {
      const downloadCartMockData = {
        cartItems: [
          {
            entityId: 1,
            entityType: 'investigation',
            id: 1,
            name: 'INVESTIGATION 1',
            parentEntities: [],
          },
          {
            entityId: 2,
            entityType: 'dataset',
            id: 2,
            name: 'DATASET 2',
            parentEntities: [],
          },
        ],
        createdAt: '2019-11-01T15:18:00Z',
        facilityName: mockedSettings.facilityName,
        id: 1,
        updatedAt: '2019-11-01T15:18:00Z',
        userName: 'test user',
      };

      axios.get = jest.fn().mockResolvedValue({
        data: downloadCartMockData,
      });

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/downloadApi/user/cart/LILS',
        {
          params: {
            sessionId: null,
          },
        }
      );
      expect(result.current.data).toEqual(downloadCartMockData.cartItems);
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveAllFromCart', () => {
    it('returns nothing upon successful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate();

      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
    });

    it('logs error upon unsuccessful response, with a retry on code 431', async () => {
      axios.delete = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({
            code: '431',
            message: 'Test 431 error message',
          })
        )
        .mockImplementation(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const { result, waitFor } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate();

      await waitFor(() => result.current.isError, { timeout: 2000 });

      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveEntityFromCart', () => {
    it('returns empty array upon successful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ entityId: 1, entityType: 'datafile' });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual([]);
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'datafile 1' } }
      );
    });

    it('logs error upon unsuccessful response', async () => {
      axios.delete = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({
            code: '431',
            message: 'Test 431 error message',
          })
        )
        .mockImplementation(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const { result, waitFor } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({ entityId: 1, entityType: 'investigation' });

      await waitFor(() => result.current.isError, { timeout: 2000 });

      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'investigation 1' } }
      );
      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useIsTwoLevel', () => {
    it('returns true if IDS is two-level', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: true,
        })
      );

      const { result, waitFor } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.idsUrl}/isTwoLevel`
      );
      expect(result.current.data).toEqual(true);
    });

    it('returns false in the event of an error and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const { result, waitFor } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.idsUrl}/isTwoLevel`
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useSizes', () => {
    it('returns the sizes of all the items in a cart', async () => {
      axios.get = jest
        .fn()
        .mockImplementation((path) => {
          if (path.includes('datafiles/')) {
            return Promise.resolve({
              data: {
                id: 1,
                name: 'test datafile',
                fileSize: 1,
              },
            });
          } else {
            return Promise.resolve({
              data: 1,
            });
          }
        })
        .mockImplementationOnce(() =>
          Promise.reject({
            message: 'simulating a failed response',
          })
        );

      const cartItems: DownloadCartItem[] = [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'INVESTIGATION 1',
          parentEntities: [],
        },
        {
          entityId: 2,
          entityType: 'dataset',
          id: 2,
          name: 'DATASET 2',
          parentEntities: [],
        },
        {
          entityId: 3,
          entityType: 'datafile',
          id: 3,
          name: 'DATAFILE 1',
          parentEntities: [],
        },
        {
          entityId: 4,
          entityType: 'investigation',
          id: 4,
          name: 'INVESTIGATION 1',
          parentEntities: [],
        },
      ];

      const { result, waitFor } = renderHook(() => useSizes(cartItems), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() =>
        result.current.every((query) => query.isSuccess || query.isError)
      );

      expect(result.current.map((query) => query.data)).toEqual([
        undefined,
        1,
        1,
        1,
      ]);
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/getSize`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            entityType: 'investigation',
            entityId: 1,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/getSize`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            entityType: 'dataset',
            entityId: 2,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datafiles/${3}`,
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'simulating a failed response',
        },
        false
      );
    });
  });

  describe('useDatafileCounts', () => {
    it('returns the counts of all the items in a cart', async () => {
      axios.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({
            data: 1,
          })
        )
        .mockImplementationOnce(() =>
          Promise.reject({
            message: 'simulating a failed response',
          })
        );

      const cartItems: DownloadCartItem[] = [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'INVESTIGATION 1',
          parentEntities: [],
        },
        {
          entityId: 2,
          entityType: 'investigation',
          id: 2,
          name: 'INVESTIGATION 2',
          parentEntities: [],
        },
        {
          entityId: 3,
          entityType: 'dataset',
          id: 3,
          name: 'DATASET 1',
          parentEntities: [],
        },
        {
          entityId: 4,
          entityType: 'datafile',
          id: 4,
          name: 'DATAFILE 1',
          parentEntities: [],
        },
      ];

      const { result, waitFor } = renderHook(
        () => useDatafileCounts(cartItems),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        result.current.every((query) => query.isSuccess || query.isError)
      );

      expect(result.current.map((query) => query.data)).toEqual([
        undefined,
        1,
        1,
        1,
      ]);
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datafiles/count`,
        {
          params: {
            where: {
              'dataset.investigation.id': {
                eq: 2,
              },
            },
          },
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datafiles/count`,
        {
          params: {
            where: {
              'dataset.id': {
                eq: 3,
              },
            },
          },
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'simulating a failed response',
        },
        false
      );
    });
  });

  describe('useDownloads', () => {
    it('should retrieve user downloads', async () => {
      const mockDownloadItems: Download[] = [
        {
          createdAt: '2020-02-25T15:05:29Z',
          downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
          email: 'test1@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-1',
          fullName: 'Person 1',
          id: 1,
          isDeleted: false,
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 1000,
          status: 'COMPLETE',
          transport: 'https',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-26T15:05:35Z',
          downloadItems: [{ entityId: 2, entityType: 'investigation', id: 2 }],
          email: 'test2@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-2',
          fullName: 'Person 2',
          id: 2,
          isDeleted: false,
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 2000,
          status: 'PREPARING',
          transport: 'globus',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-27T15:57:20Z',
          downloadItems: [{ entityId: 3, entityType: 'investigation', id: 3 }],
          email: 'test3@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-3',
          fullName: 'Person 3',
          id: 3,
          isDeleted: false,
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 3000,
          status: 'RESTORING',
          transport: 'https',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-28T15:57:28Z',
          downloadItems: [{ entityId: 4, entityType: 'investigation', id: 4 }],
          email: 'test4@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-4',
          fullName: 'Person 4',
          id: 4,
          isDeleted: false,
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 4000,
          status: 'EXPIRED',
          transport: 'globus',
          userName: 'test user',
        },
        {
          createdAt: '2020-03-01T15:57:28Z[UTC]',
          downloadItems: [{ entityId: 5, entityType: 'investigation', id: 5 }],
          email: 'test5@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-5',
          fullName: 'Person 5',
          id: 5,
          isDeleted: false,
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 5000,
          status: 'PAUSED',
          transport: 'globus',
          userName: 'test user',
        },
      ];

      const mockFormattedDownloadItems: FormattedDownload[] = [
        {
          createdAt: '2020-02-25T15:05:29Z',
          downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
          email: 'test1@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-1',
          fullName: 'Person 1',
          id: 1,
          isDeleted: 'No',
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 1000,
          status: 'downloadStatus.complete',
          transport: 'https',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-26T15:05:35Z',
          downloadItems: [{ entityId: 2, entityType: 'investigation', id: 2 }],
          email: 'test2@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-2',
          fullName: 'Person 2',
          id: 2,
          isDeleted: 'No',
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 2000,
          status: 'downloadStatus.preparing',
          transport: 'globus',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-27T15:57:20Z',
          downloadItems: [{ entityId: 3, entityType: 'investigation', id: 3 }],
          email: 'test3@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-3',
          fullName: 'Person 3',
          id: 3,
          isDeleted: 'No',
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 3000,
          status: 'downloadStatus.restoring',
          transport: 'https',
          userName: 'test user',
        },
        {
          createdAt: '2020-02-28T15:57:28Z',
          downloadItems: [{ entityId: 4, entityType: 'investigation', id: 4 }],
          email: 'test4@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-4',
          fullName: 'Person 4',
          id: 4,
          isDeleted: 'No',
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 4000,
          status: 'downloadStatus.expired',
          transport: 'globus',
          userName: 'test user',
        },
        {
          createdAt: '2020-03-01T15:57:28Z[UTC]',
          downloadItems: [{ entityId: 5, entityType: 'investigation', id: 5 }],
          email: 'test5@email.com',
          facilityName: 'LILS',
          fileName: 'test-file-5',
          fullName: 'Person 5',
          id: 5,
          isDeleted: 'No',
          isEmailSent: true,
          isTwoLevel: false,
          preparedId: 'test-prepared-id',
          sessionId: 'test-session-id',
          size: 5000,
          status: 'downloadStatus.paused',
          transport: 'globus',
          userName: 'test user',
        },
      ];

      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });

      const { result, waitFor } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(result.current.data).toEqual(mockFormattedDownloadItems);
    });

    it('should call handleICATError on failure', async () => {
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useDownloadDeleted', () => {
    it('should delete download with given id and update the download list upon success', async () => {
      const mockDownloadItems: Download[] = [
        {
          createdAt: 'created-at',
          downloadItems: [],
          facilityName: mockedSettings.facilityName,
          fileName: 'file-name',
          fullName: 'fullName',
          id: 123,
          isDeleted: false,
          isEmailSent: false,
          isTwoLevel: false,
          preparedId: 'prepare-id',
          sessionId: 'session-id',
          size: 23,
          status: 'PREPARING',
          transport: 'http',
          userName: 'username',
          email: 'a@b.c',
        },
      ];

      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadDeleted: useDownloadDeleted(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for useDownloads to finish loading mock download items
      await waitFor(() => result.current.useDownloads.isSuccess);
      // delete the mock item
      result.current.useDownloadDeleted.mutate({
        downloadId: 123,
        deleted: true,
      });
      // wait for mutation to complete
      await waitFor(() => result.current.useDownloadDeleted.isSuccess);

      expect(result.current.useDownloads.data).toHaveLength(0);
    });

    it('should restore download with given id and update download list upon success', async () => {
      const mockDownloadItems: Download[] = [
        {
          createdAt: 'created-at',
          downloadItems: [],
          facilityName: mockedSettings.facilityName,
          fileName: 'file-name',
          fullName: 'fullName',
          id: 123,
          isDeleted: false,
          isEmailSent: false,
          isTwoLevel: false,
          preparedId: 'prepare-id',
          sessionId: 'session-id',
          size: 23,
          status: 'PREPARING',
          transport: 'http',
          userName: 'username',
          email: 'a@b.c',
        },
      ];

      const mockRestoredDownload: Download = {
        createdAt: 'created-at',
        downloadItems: [],
        facilityName: mockedSettings.facilityName,
        fileName: 'file-name',
        fullName: 'fullName',
        id: 124,
        isDeleted: false,
        isEmailSent: false,
        isTwoLevel: false,
        preparedId: 'prepare-id',
        sessionId: 'session-id',
        size: 21,
        status: 'PREPARING',
        transport: 'http',
        userName: 'username',
        email: 'a@b.c',
      };

      const mockRestoredFormattedDownload: FormattedDownload = {
        createdAt: 'created-at',
        downloadItems: [],
        facilityName: mockedSettings.facilityName,
        fileName: 'file-name',
        fullName: 'fullName',
        id: 124,
        isDeleted: 'No',
        isEmailSent: false,
        isTwoLevel: false,
        preparedId: 'prepare-id',
        sessionId: 'session-id',
        size: 21,
        status: 'downloadStatus.preparing',
        transport: 'http',
        userName: 'username',
        email: 'a@b.c',
      };

      axios.get = jest.fn().mockImplementation((url, { params }) => {
        if (
          url === `${mockedSettings.downloadApiUrl}/user/downloads` &&
          params.queryOffset === 'where download.isDeleted = false'
        )
          return Promise.resolve({ data: mockDownloadItems });

        if (
          url === `${mockedSettings.downloadApiUrl}/user/downloads` &&
          params.queryOffset === 'where download.id = 124'
        )
          return Promise.resolve({ data: [mockRestoredDownload] });

        return Promise.reject();
      });

      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadDeleted: useDownloadDeleted(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.useDownloads.isSuccess);
      result.current.useDownloadDeleted.mutate({
        downloadId: 124,
        deleted: false,
      });
      await waitFor(() => result.current.useDownloadDeleted.isSuccess);

      const newList = result.current.useDownloads.data;

      expect(newList).toHaveLength(2);
      expect(newList?.find(({ id }) => id === 124)).toEqual(
        mockRestoredFormattedDownload
      );
    });

    it('should call handleICATError if an error is encountered', async () => {
      axios.put = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useDownloadDeleted(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({
        downloadId: 123,
        deleted: true,
      });
      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});
