import axios from 'axios';
import {
  fetchDownloadCartItems,
  removeAllDownloadCartItems,
  removeDownloadCartItem,
  getSize,
  getDatafileCount,
  getCartDatafileCount,
  getCartSize,
  submitCart,
  getIsTwoLevel,
  getDownload,
  downloadPreparedCart,
} from './downloadCartApi';
import { DownloadCartItem, handleICATError } from 'datagateway-common';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

describe('Download Cart API functions test', () => {
  const settings = {
    facilityName: 'LILS',
    apiUrl: 'http://scigateway-preprod.esc.rl.ac.uk:5000',
    downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
    idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
  };

  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
  });

  describe('fetchDownloadCartItems', () => {
    it('returns cartItems upon successful response', async () => {
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
        facilityName: 'LILS',
        id: 1,
        updatedAt: '2019-11-01T15:18:00Z',
        userName: 'test user',
      };

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadCartMockData,
        })
      );

      const returnData = await fetchDownloadCartItems(
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(downloadCartMockData.cartItems);
      expect(axios.get).toHaveBeenCalled();
      expect(
        axios.get
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS',
        { params: { sessionId: null } }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await fetchDownloadCartItems(
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
      expect(
        axios.get
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS',
        { params: { sessionId: null } }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('removeAllDownloadCartItems', () => {
    it('returns nothing upon successful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: { cartItems: [], facilityName: 'LILS', userName: 'test user' },
        })
      );

      const returnData = await removeAllDownloadCartItems(
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
        { params: { sessionId: null, items: '*' } }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await removeAllDownloadCartItems(
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
        { params: { sessionId: null, items: '*' } }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('removeDownloadCartItem', () => {
    it('returns nothing upon successful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: { cartItems: [], facilityName: 'LILS', userName: 'test user' },
        })
      );

      const returnData = await removeDownloadCartItem(
        1,
        'datafile',
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
        { params: { sessionId: null, items: 'datafile 1' } }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await removeDownloadCartItem(
        1,
        'investigation',
        settings.facilityName,
        settings.downloadApiUrl
      );

      expect(returnData).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(
        axios.delete
      ).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
        { params: { sessionId: null, items: 'investigation 1' } }
      );
      expect(handleICATError).toHaveBeenCalled();
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

      const isTwoLevel = await getIsTwoLevel(settings.idsUrl);

      expect(isTwoLevel).toBe(true);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/ids/isTwoLevel'
      );
    });

    it('returns false in the event of an error and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const isTwoLevel = await getIsTwoLevel(settings.idsUrl);

      expect(isTwoLevel).toBe(false);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/ids/isTwoLevel'
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });
  });

  describe('submitCart', () => {
    it('returns the downloadId after the submitting cart', async () => {
      axios.post = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          data: {
            facilityName: 'LILS',
            userName: 'test user',
            cartItems: [],
            downloadId: 1,
          },
        });
      });

      // Wait for our mocked response with a download id.
      const downloadId = await submitCart(
        'LILS',
        'https',
        'test@email.com',
        'test-file',
        settings.downloadApiUrl
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
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
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
        'LILS',
        'globus',
        'test@email.com',
        'test-file',
        settings.downloadApiUrl
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
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
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
              facilityName: 'LILS',
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

      const download = await getDownload('LILS', 1, settings.downloadApiUrl);

      expect(download).not.toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
        {
          params: {
            sessionId: null,
            facilityName: 'LILS',
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

      const download = await getDownload('LILS', 1, settings.downloadApiUrl);

      expect(download).toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
        {
          params: {
            sessionId: null,
            facilityName: 'LILS',
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
    it('opens a link to download test-file upon successful response for a download request', async () => {
      jest.spyOn(document, 'createElement');
      jest.spyOn(document.body, 'appendChild');

      await downloadPreparedCart('test-id', 'test-file.zip', settings.idsUrl);

      expect(document.createElement).toHaveBeenCalledWith('a');

      // Create our prepared cart download link.
      let link = document.createElement('a');
      link.href = `https://scigateway-preprod.esc.rl.ac.uk:8181/ids/getData?sessionId=${null}&preparedId=${'test-id'}&outname=${'test-file.zip'}`;
      link.style.display = 'none';
      link.target = '_blank';

      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });
  });

  describe('getSize', () => {
    it('returns a number upon successful response for datafile entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            ID: 1,
            NAME: 'test datafile',
            FILESIZE: 1,
          },
        })
      );

      const returnData = await getSize(
        1,
        'datafile',
        settings.facilityName,
        settings.apiUrl,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(1);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/1',
        {
          headers: { Authorization: 'Bearer null' },
        }
      );
    });

    it('returns -1 and logs error upon unsuccessful response for datafile entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await getSize(
        1,
        'datafile',
        settings.facilityName,
        settings.apiUrl,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(-1);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/1',
        {
          headers: { Authorization: 'Bearer null' },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });

    it('returns a number upon successful response for non-datafile entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: 2,
        })
      );

      const returnData = await getSize(
        1,
        'dataset',
        settings.facilityName,
        settings.apiUrl,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(2);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'LILS',
            entityType: 'dataset',
            entityId: 1,
          },
        }
      );
    });

    it('returns -1 and logs error upon unsuccessful response for non-datafile entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await getSize(
        1,
        'investigation',
        settings.facilityName,
        settings.apiUrl,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(-1);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'LILS',
            entityType: 'investigation',
            entityId: 1,
          },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });
  });

  describe('getDatafileCount', () => {
    it('returns 1 upon request for datafile entityType', async () => {
      const returnData = await getDatafileCount(1, 'datafile', settings.apiUrl);

      expect(returnData).toBe(1);
    });

    it('returns a number upon successful response for dataset entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: 2,
        })
      );

      const returnData = await getDatafileCount(1, 'dataset', settings.apiUrl);

      expect(returnData).toBe(2);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/count',
        {
          params: {
            where: {
              DATASET_ID: {
                eq: 1,
              },
            },
          },
          headers: { Authorization: 'Bearer null' },
        }
      );
    });

    it('returns -1 and logs error upon unsuccessful response for dataset entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await getDatafileCount(1, 'dataset', settings.apiUrl);

      expect(returnData).toBe(-1);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/count',
        {
          params: {
            where: {
              DATASET_ID: {
                eq: 1,
              },
            },
          },
          headers: { Authorization: 'Bearer null' },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });

    it('returns a number upon successful response for investigation entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: 5,
        })
      );

      const returnData = await getDatafileCount(
        2,
        'investigation',
        settings.apiUrl
      );

      expect(returnData).toBe(5);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/count',
        {
          params: {
            include: '"DATASET"',
            where: {
              'DATASET.INVESTIGATION_ID': {
                eq: 2,
              },
            },
          },
          headers: { Authorization: 'Bearer null' },
        }
      );
    });

    it('returns -1 and logs error upon unsuccessful response for investigation entityType', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await getDatafileCount(
        2,
        'investigation',
        settings.apiUrl
      );

      expect(returnData).toBe(-1);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        'http://scigateway-preprod.esc.rl.ac.uk:5000/datafiles/count',
        {
          params: {
            include: '"DATASET"',
            where: {
              'DATASET.INVESTIGATION_ID': {
                eq: 2,
              },
            },
          },
          headers: { Authorization: 'Bearer null' },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });
  });

  describe('getCartDatafileCount', () => {
    it('returns an accurate count of a given cart', async () => {
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

      const returnData = await getCartDatafileCount(cartItems, settings.apiUrl);

      expect(returnData).toBe(3);
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'simulating a failed response',
        },
        false
      );
    });
  });

  describe('getCartSize', () => {
    it('returns an accurate size of a given cart', async () => {
      axios.get = jest
        .fn()
        .mockImplementation(path => {
          if (path.includes('datafiles/')) {
            return Promise.resolve({
              data: {
                ID: 1,
                NAME: 'test datafile',
                FILESIZE: 1,
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

      const returnData = await getCartSize(
        cartItems,
        settings.facilityName,
        settings.apiUrl,
        settings.downloadApiUrl
      );

      expect(returnData).toBe(3);
      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'simulating a failed response',
        },
        false
      );
    });
  });
});
