import {
  FailurePayload,
  DownloadCartPayload,
  FetchDownloadCartSuccessType,
  FetchDownloadCartFailureType,
  FetchDownloadCartRequestType,
  AddToCartSuccessType,
  AddToCartFailureType,
  AddToCartRequestType,
  RemoveFromCartSuccessType,
  RemoveFromCartFailureType,
  RemoveFromCartRequestType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';
import { DownloadCart } from 'datagateway-common';

export const fetchDownloadCartSuccess = (
  downloadCart: DownloadCart
): ActionType<DownloadCartPayload> => ({
  type: FetchDownloadCartSuccessType,
  payload: {
    downloadCart,
  },
});

export const fetchDownloadCartFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchDownloadCartFailureType,
  payload: {
    error,
  },
});

export const fetchDownloadCartRequest = (): Action => ({
  type: FetchDownloadCartRequestType,
});

export const fetchDownloadCart = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchDownloadCartRequest());

    const { downloadApiUrl } = getState().dgtable.urls;

    // TODO: get facility name from somewhere else...
    await axios
      .get(`${downloadApiUrl}/user/cart/LILS`, {
        params: {
          // TODO: get session ID from somewhere else (extract from JWT)
          sessionId: window.localStorage.getItem('icat:token'),
        },
      })
      .then(response => {
        dispatch(fetchDownloadCartSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(fetchDownloadCartFailure(error.message));
      });
  };
};

export const addToCartSuccess = (
  downloadCart: DownloadCart
): ActionType<DownloadCartPayload> => ({
  type: AddToCartSuccessType,
  payload: {
    downloadCart,
  },
});

export const addToCartFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: AddToCartFailureType,
  payload: {
    error,
  },
});

export const addToCartRequest = (): Action => ({
  type: AddToCartRequestType,
});

export const addToCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(addToCartRequest());

    const { downloadApiUrl } = getState().dgtable.urls;

    const params = new URLSearchParams();
    // TODO: get session ID from somewhere else (extract from JWT)
    params.append('sessionId', window.localStorage.getItem('icat:token') || '');
    params.append(
      'items',
      `${entityType} ${entityIds.join(`, ${entityType} `)}`
    );

    // TODO: get facility name from somewhere else...
    await axios
      .post(`${downloadApiUrl}/user/cart/LILS/cartItems`, params)
      .then(response => {
        dispatch(addToCartSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(addToCartFailure(error.message));
      });
  };
};

export const removeFromCartSuccess = (
  downloadCart: DownloadCart
): ActionType<DownloadCartPayload> => ({
  type: RemoveFromCartSuccessType,
  payload: {
    downloadCart,
  },
});

export const removeFromCartFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: RemoveFromCartFailureType,
  payload: {
    error,
  },
});

export const removeFromCartRequest = (): Action => ({
  type: RemoveFromCartRequestType,
});

export const removeFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(removeFromCartRequest());

    const { downloadApiUrl } = getState().dgtable.urls;

    // TODO: get facility name from somewhere else...
    await axios
      .delete(`${downloadApiUrl}/user/cart/LILS/cartItems`, {
        params: {
          // TODO: get session ID from somewhere else (extract from JWT)
          sessionId: window.localStorage.getItem('icat:token'),
          items: `${entityType} ${entityIds.join(`, ${entityType} `)}`,
        },
      })
      .then(response => {
        dispatch(removeFromCartSuccess(response.data));
      })
      .catch(error => {
        log.error(error.message);
        dispatch(removeFromCartFailure(error.message));
      });
  };
};
