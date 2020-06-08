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
  FetchAllIdsSuccessPayload,
  FetchAllIdsSuccessType,
  FetchAllIdsFailureType,
  RequestPayload,
  FetchAllIdsRequestType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import axios from 'axios';
import { DownloadCart, Investigation } from '../../app.types';
import { getApiFilter } from '.';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

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

    const { downloadApiUrl } = getState().dgcommon.urls;

    // TODO: get facility name from somewhere else...
    await axios
      .get(`${downloadApiUrl}/user/cart/LILS`, {
        params: {
          sessionId: readSciGatewayToken().sessionId,
        },
      })
      .then(response => {
        dispatch(fetchDownloadCartSuccess(response.data));
      })
      .catch(error => {
        handleICATError(error);
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

    const { downloadApiUrl } = getState().dgcommon.urls;

    const params = new URLSearchParams();
    params.append('sessionId', readSciGatewayToken().sessionId || '');
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
        handleICATError(error);
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

    const { downloadApiUrl } = getState().dgcommon.urls;

    // TODO: get facility name from somewhere else...
    await axios
      .delete(`${downloadApiUrl}/user/cart/LILS/cartItems`, {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: `${entityType} ${entityIds.join(`, ${entityType} `)}`,
        },
      })
      .then(response => {
        dispatch(removeFromCartSuccess(response.data));
      })
      .catch(error => {
        handleICATError(error);
        dispatch(removeFromCartFailure(error.message));
      });
  };
};

export const fetchAllIdsSuccess = (
  allIds: number[],
  timestamp: number
): ActionType<FetchAllIdsSuccessPayload> => ({
  type: FetchAllIdsSuccessType,
  payload: {
    data: allIds,
    timestamp,
  },
});

export const fetchAllIdsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchAllIdsFailureType,
  payload: {
    error,
  },
});

export const fetchAllIdsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchAllIdsRequestType,
  payload: {
    timestamp,
  },
});

// export const fetchFilter = (
//   entityType: 'investigation' | 'dataset',
//   additionalFilters?: {
//     filterType: 'where' | 'distinct' | 'include';
//     filterValue: string;
//   }[]
// ): ThunkResult<Promise<void>> => {
//   return async (dispatch, getState) => {
//     const timestamp = Date.now();
//     dispatch(fetchFilterRequest(timestamp));

//     let params = new URLSearchParams();

//     // sort by ID first to guarantee order
//     params.append('order', JSON.stringify(`ID asc`));
//   };
// };

export const fetchAllIds = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchAllIdsRequest(timestamp));

    let params = getApiFilter(getState);
    if (additionalFilters) {
      additionalFilters.forEach(filter => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    const distinctFilterString = params.get('distinct');
    if (distinctFilterString) {
      const distinctFilter: string | string[] = JSON.parse(
        distinctFilterString
      );
      if (typeof distinctFilter === 'string') {
        params.set('distinct', JSON.stringify([distinctFilter, 'ID']));
      } else {
        params.set('distinct', JSON.stringify([...distinctFilter, 'ID']));
      }
    } else {
      params.set('distinct', JSON.stringify('ID'));
    }

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get<{ ID: number }[]>(`${apiUrl}/${entityType}s`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(
          fetchAllIdsSuccess(
            response.data.map(x => x.ID),
            timestamp
          )
        );
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchAllIdsFailure(error.message));
      });
  };
};

export const fetchAllISISInvestigationIds = (
  instrumentId: number,
  facilityCycleId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchAllIdsRequest(timestamp));

    let params = getApiFilter(getState);

    // TODO: currently datagateway-api can't apply distinct filter to ISIS queries,
    // so for now just retrieve everything
    // params.set('distinct', JSON.stringify('ID'));

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get<Investigation[]>(
        `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations`,
        {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
        }
      )
      .then(response => {
        dispatch(
          fetchAllIdsSuccess(
            response.data.map(x => x.ID),
            timestamp
          )
        );
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchAllIdsFailure(error.message));
      });
  };
};
