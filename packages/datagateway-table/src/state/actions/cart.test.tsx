import {
  fetchDownloadCart,
  fetchDownloadCartRequest,
  fetchDownloadCartSuccess,
  fetchDownloadCartFailure,
  addToCart,
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  removeFromCart,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
} from '.';
import axios from 'axios';
import { actions, dispatch, getState, resetActions } from '../../setupTests';
import * as log from 'loglevel';
import { DownloadCart } from 'datagateway-common';

jest.mock('loglevel');

describe('Cart actions', () => {
  const mockData: DownloadCart = {
    cartItems: [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'DATASET 1',
        parentEntities: [],
      },
    ],
    createdAt: '2019-10-15T14:11:43+01:00',
    facilityName: 'TEST',
    id: 1,
    updatedAt: '2019-10-15T14:11:43+01:00',
    userName: 'test',
  };

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (axios.delete as jest.Mock).mockClear();
    resetActions();
  });

  describe('fetchDownloadCart action', () => {
    it('dispatches fetchDownloadCartRequest and fetchDownloadCartSuccess actions upon successful fetchDownloadCart action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockData,
        })
      );

      const asyncAction = fetchDownloadCart();
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchDownloadCartRequest());
      expect(actions[1]).toEqual(fetchDownloadCartSuccess(mockData));
      expect(axios.get).toHaveBeenCalledWith(
        '/user/cart/LILS',
        expect.objectContaining({
          params: {
            sessionId: null,
          },
        })
      );
    });

    it('dispatches fetchDownloadCartRequest and fetchDownloadCartFailure actions upon unsuccessful fetchDownloadCart action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const asyncAction = fetchDownloadCart();
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchDownloadCartRequest());
      expect(actions[1]).toEqual(
        fetchDownloadCartFailure('Test error message')
      );

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toEqual('Test error message');
    });
  });

  describe('addToCart action', () => {
    it('dispatches addToCartRequest and addToCartSuccess actions upon successful addToCart action', async () => {
      (axios.post as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockData,
        })
      );

      const asyncAction = addToCart('dataset', [1, 2]);
      await asyncAction(dispatch, getState, null);

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('items', 'dataset 1, dataset 2');

      expect(actions[0]).toEqual(addToCartRequest());
      expect(actions[1]).toEqual(addToCartSuccess(mockData));
      expect(axios.post).toHaveBeenCalledWith(
        '/user/cart/LILS/cartItems',
        expect.objectContaining(params)
      );
    });

    it('dispatches addToCartRequest and addToCartFailure actions upon unsuccessful addToCart action', async () => {
      (axios.post as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const asyncAction = addToCart('dataset', [1, 2]);
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(addToCartRequest());
      expect(actions[1]).toEqual(addToCartFailure('Test error message'));

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toEqual('Test error message');
    });
  });

  describe('removeFromCart action', () => {
    it('dispatches removeFromCartRequest and removeFromCartSuccess actions upon successful removeFromCart action', async () => {
      (axios.delete as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockData,
        })
      );

      const asyncAction = removeFromCart('dataset', [1, 2]);
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(removeFromCartRequest());
      expect(actions[1]).toEqual(removeFromCartSuccess(mockData));
      expect(axios.delete).toHaveBeenCalledWith(
        '/user/cart/LILS/cartItems',
        expect.objectContaining({
          params: {
            sessionId: null,
            items: 'dataset 1, dataset 2',
          },
        })
      );
    });

    it('dispatches removeFromCartRequest and removeFromCartFailure actions upon unsuccessful removeFromCart action', async () => {
      (axios.delete as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const asyncAction = removeFromCart('dataset', [1, 2]);
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(removeFromCartRequest());
      expect(actions[1]).toEqual(removeFromCartFailure('Test error message'));

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toEqual('Test error message');
    });
  });
});
