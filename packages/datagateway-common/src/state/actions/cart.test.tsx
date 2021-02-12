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
import { DownloadCart } from '../../app.types';
import {
  fetchAllIds,
  fetchAllIdsRequest,
  fetchAllIdsSuccess,
  fetchAllIdsFailure,
  fetchAllISISInvestigationIds,
} from './cart';
import { initialState } from '../reducers/dgcommon.reducer';
import { StateType } from '../app.types';
import handleICATError from '../../handleICATError';

jest.mock('../../handleICATError');

describe('Cart actions', () => {
  Date.now = jest.fn().mockImplementation(() => 1);

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
    (handleICATError as jest.Mock).mockClear();
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

      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
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
        params
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

      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
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

      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('fetchAllIds action', () => {
    const mockAllIdsData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it('dispatches fetchAllIdsRequest and fetchAllIdsSuccess actions upon successful fetchAllIds action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockAllIdsData,
        })
      );

      const asyncAction = fetchAllIds('investigation');
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsSuccess([1, 2, 3], 1));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('id asc'));
      params.append('distinct', JSON.stringify('id'));

      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        headers: { Authorization: 'Bearer null' },
        params,
      });
    });

    it('applies additional filters as well as sort and filter state to the request params', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockAllIdsData,
        })
      );

      const asyncAction = fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ dataset: { eq: 1 } }),
        },
        {
          filterType: 'distinct',
          filterValue: JSON.stringify('name'),
        },
      ]);

      const getState = (): Partial<StateType> => ({
        dgcommon: {
          ...initialState,
          query: {
            ...initialState.query,
            sort: { column1: 'desc' },
            filters: { column1: '1', column2: '2' },
          },
        },
      });
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsSuccess([1, 2, 3], 1));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 desc'));
      params.append('order', JSON.stringify('id asc'));
      params.append('where', JSON.stringify({ column1: { like: '1' } }));
      params.append('where', JSON.stringify({ column2: { like: '2' } }));
      params.append('where', JSON.stringify({ dataset: { eq: 1 } }));
      params.append('distinct', JSON.stringify(['name', 'id']));

      expect(axios.get).toHaveBeenCalledWith('/datasets', {
        headers: { Authorization: 'Bearer null' },
        params,
      });
    });

    it('can handle array distinct filters and add them to request params', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockAllIdsData,
        })
      );

      const asyncAction = fetchAllIds('datafile', [
        {
          filterType: 'distinct',
          filterValue: JSON.stringify(['name', 'title']),
        },
      ]);

      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsSuccess([1, 2, 3], 1));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('id asc'));
      params.append('distinct', JSON.stringify(['name', 'title', 'id']));

      expect(axios.get).toHaveBeenCalledWith('/datafiles', {
        headers: { Authorization: 'Bearer null' },
        params,
      });
    });

    it('dispatches fetchAllIdsRequest and fetchAllIdsFailure actions upon unsuccessful fetchAllIds action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const asyncAction = fetchAllIds('datafile');
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsFailure('Test error message'));

      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('fetchAllISISInvestigationIds action', () => {
    const mockAllIdsData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it('dispatches fetchAllIdsRequest and fetchAllIdsSuccess actions upon successful fetchAllISISInvestigationIds action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockAllIdsData,
        })
      );

      const asyncAction = fetchAllISISInvestigationIds(1, 2);
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsSuccess([1, 2, 3], 1));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('id asc'));

      expect(axios.get).toHaveBeenCalledWith(
        '/instruments/1/facilitycycles/2/investigations',
        {
          headers: { Authorization: 'Bearer null' },
          params,
        }
      );
    });

    it('applies filter state to the request params', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: mockAllIdsData,
        })
      );

      const asyncAction = fetchAllISISInvestigationIds(1, 2);

      const getState = (): Partial<StateType> => ({
        dgcommon: {
          ...initialState,
          query: {
            ...initialState.query,
            sort: { column1: 'desc' },
            filters: { column1: '1', column2: '2' },
          },
        },
      });
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsSuccess([1, 2, 3], 1));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 desc'));
      params.append('order', JSON.stringify('id asc'));
      params.append('where', JSON.stringify({ column1: { like: '1' } }));
      params.append('where', JSON.stringify({ column2: { like: '2' } }));

      expect(axios.get).toHaveBeenCalledWith(
        '/instruments/1/facilitycycles/2/investigations',
        {
          headers: { Authorization: 'Bearer null' },
          params,
        }
      );
    });

    it('dispatches fetchAllIdsRequest and fetchAllIdsFailure actions upon unsuccessful fetchAllISISInvestigationIds action', async () => {
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const asyncAction = fetchAllISISInvestigationIds(1, 2);
      await asyncAction(dispatch, getState, null);

      expect(actions[0]).toEqual(fetchAllIdsRequest(1));
      expect(actions[1]).toEqual(fetchAllIdsFailure('Test error message'));

      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});
