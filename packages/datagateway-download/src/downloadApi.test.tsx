import axios from 'axios';
import { DownloadCartItem, handleICATError } from 'datagateway-common';
import {
  downloadDeleted,
  downloadPreparedCart,
  fetchDownloads,
  getDownload,
  submitCart,
  getDataUrl,
  fetchAdminDownloads,
  adminDownloadDeleted,
  adminDownloadStatus,
  useCart,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
  useIsTwoLevel,
  useSizes,
  useDatafileCounts,
} from './downloadApi';
import { renderHook, WrapperComponent } from '@testing-library/react-hooks';
import React from 'react';
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

describe('Download Cart API functions test', () => {
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

  describe('removeAllDownloadCartItems', () => {
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

    it('logs error upon unsuccessful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate();

      await waitFor(() => result.current.isError);

      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('removeDownloadCartItem', () => {
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
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({ entityId: 1, entityType: 'investigation' });

      await waitFor(() => result.current.isError);

      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'investigation 1' } }
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('getIsTwoLevel', () => {
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

  describe('submitCart', () => {
    it('returns the downloadId after the submitting cart', async () => {
      axios.post = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          data: {
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
            cartItems: [],
            downloadId: 1,
          },
        });
      });

      // Wait for our mocked response with a download id.
      const downloadId = await submitCart(
        'https',
        'test@email.com',
        'test-file',
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        }
      );
      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('transport', 'https');
      params.append('email', 'test@email.com');
      params.append('fileName', 'test-file');
      params.append('zipType', 'ZIP');

      expect(downloadId).toBe(1);
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
        params
      );
    });

    it('returns -1 if an errors occurs and logs the error upon unsuccessful response', async () => {
      axios.post = jest.fn().mockImplementation(() => {
        return Promise.reject({
          message: 'Test error message',
        });
      });

      // Wait for our mocked response with a download id.
      const downloadId = await submitCart(
        'globus',
        'test@email.com',
        'test-file',
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        }
      );
      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('transport', 'globus');
      params.append('email', 'test@email.com');
      params.append('fileName', 'test-file');
      params.append('zipType', 'ZIP');

      expect(downloadId).toBe(-1);
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('getDownload', () => {
    it('returns the download information upon successful response for download ID', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: [
            {
              createdAt: '2020-01-01T01:01:01Z',
              downloadItems: [
                {
                  entityId: 1,
                  entityType: 'investigation',
                  id: 1,
                },
              ],
              facilityName: mockedSettings.facilityName,
              fileName: 'test-file',
              fullName: 'simple/root',
              id: 1,
              isDeleted: false,
              isEmailSent: false,
              isTwoLevel: false,
              preparedId: 'test-prepared-id',
              sessionId: '',
              size: 0,
              status: 'COMPLETE',
              transport: 'https',
              userName: 'simple/root',
            },
          ],
        })
      );

      const download = await getDownload(1, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(download).not.toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: `where download.id = 1`,
          },
        }
      );
    });

    it('returns null if error occurs and logs the error message upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const download = await getDownload(1, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(download).toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: `where download.id = 1`,
          },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('downloadPreparedCart', () => {
    it('opens a link to download "test-file" upon successful response for a download request', async () => {
      jest.spyOn(document, 'createElement');
      jest.spyOn(document.body, 'appendChild');

      await downloadPreparedCart('test-id', 'test-file.zip', {
        idsUrl: mockedSettings.idsUrl,
      });

      expect(document.createElement).toHaveBeenCalledWith('a');

      // Create our prepared cart download link.
      const link = document.createElement('a');
      link.href = `${
        mockedSettings.idsUrl
      }/getData?sessionId=${null}&preparedId=${'test-id'}&outname=${'test-file.zip'}`;
      link.style.display = 'none';
      link.target = '_blank';

      expect(document.body.appendChild).toHaveBeenCalledWith(link);
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
});

describe('Download Status API functions test', () => {
  describe('fetchDownloads', () => {
    const downloadsMockData = [
      {
        createdAt: '2020-01-01T01:01:01Z',
        downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
        email: 'test@email.com',
        facilityName: mockedSettings.facilityName,
        fileName: 'test-file-1',
        fullName: 'Person 1',
        id: 1,
        isDeleted: false,
        isEmailSent: true,
        isTwoLevel: false,
        preparedId: 'e44acee7-2211-4aae-bffb-f6c0e417f43d',
        sessionId: '6bf8e6e4-58a9-11ea-b823-005056893dd9',
        size: 0,
        status: 'COMPLETE',
        transport: 'https',
        userName: 'test user',
      },
    ];

    it('returns downloads upon successful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsMockData,
        })
      );

      const returnData = await fetchDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toBe(downloadsMockData);
      expect(axios.get).toHaveBeenCalled();
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
    });

    it('returns downloads with a custom queryOffset upon successful response', async () => {
      const downloadsData = {
        ...downloadsMockData[0],
        isDeleted: true,
      };

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsData,
        })
      );

      const returnData = await fetchDownloads(
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        },
        'where download.isDeleted = true'
      );

      expect(returnData).toBe(downloadsData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = true',
          },
        }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await fetchDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
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
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('downloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await downloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/download/1/isDeleted`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await downloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/download/1/isDeleted`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('getDataUrl', () => {
    it('successfully constructs a download link with given parameters', () => {
      const preparedId = 'test-prepared-id';
      const fileName = 'test-filename';
      const idsUrl = 'test-ids-url';

      const result = getDataUrl(preparedId, fileName, idsUrl);
      [preparedId, fileName, idsUrl].forEach((entry) => {
        expect(result).toContain(entry);
      });
    });
  });
});

describe('Admin Download Status API functions test', () => {
  describe('fetchAdminDownloads', () => {
    const downloadsMockData = [
      {
        createdAt: '2020-01-01T01:01:01Z',
        downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
        email: 'test@email.com',
        facilityName: mockedSettings.facilityName,
        fileName: 'test-file-1',
        fullName: 'Person 1',
        id: 1,
        isDeleted: false,
        isEmailSent: true,
        isTwoLevel: false,
        preparedId: 'e44acee7-2211-4aae-bffb-f6c0e417f43d',
        sessionId: '6bf8e6e4-58a9-11ea-b823-005056893dd9',
        size: 0,
        status: 'COMPLETE',
        transport: 'https',
        userName: 'test user',
      },
    ];

    it('returns downloads upon successful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsMockData,
        })
      );

      const returnData = await fetchAdminDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toBe(downloadsMockData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
    });

    it('returns downloads with a custom queryOffset upon successful response', async () => {
      const downloadsData = {
        ...downloadsMockData[0],
        isDeleted: true,
      };

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsData,
        })
      );

      const returnData = await fetchAdminDownloads(
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        },
        'where download.isDeleted = true'
      );

      expect(returnData).toBe(downloadsData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = true',
          },
        }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await fetchAdminDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('adminDownloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await adminDownloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/isDeleted`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await adminDownloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/isDeleted`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('adminDownloadStatus', () => {
    it('successfully sets the status of a download', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await adminDownloadStatus(1, 'RESTORING', {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'RESTORING');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/status`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await adminDownloadStatus(1, 'RESTORING', {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'RESTORING');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/status`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});
