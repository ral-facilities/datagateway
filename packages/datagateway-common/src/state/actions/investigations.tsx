import axios from 'axios';
import { batch } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action } from 'redux';
import { getApiFilter, nestedValue } from '.';
import { Entity, Investigation } from '../../app.types';
import handleICATError from '../../handleICATError';
import { readSciGatewayToken } from '../../parseTokens';
import { ActionType, ThunkResult } from '../app.types';
import {
  FailurePayload,
  FetchCountSuccessPayload,
  FetchDataSuccessPayload,
  FetchDetailsSuccessPayload,
  FetchFilterFailureType,
  FetchFilterRequestType,
  FetchFilterSuccessPayload,
  FetchFilterSuccessType,
  FetchInvestigationCountFailureType,
  FetchInvestigationCountRequestType,
  FetchInvestigationCountSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchInvestigationDetailsRequestType,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationSizeFailureType,
  FetchInvestigationSizeRequestType,
  FetchInvestigationSizeSuccessType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessType,
  FetchSizeSuccessPayload,
  RequestPayload,
} from './actions.types';
import { fetchInvestigationDatasetsCount } from './datasets';

export const fetchInvestigationsSuccess = (
  investigations: Investigation[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInvestigationsSuccessType,
  payload: {
    data: investigations,
    timestamp,
  },
});

export const fetchInvestigationsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationsRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationSizeRequest = (): Action => ({
  type: FetchInvestigationSizeRequestType,
});

export const fetchInvestigationSizeSuccess = (
  investigationId: number,
  size: number
): ActionType<FetchSizeSuccessPayload> => ({
  type: FetchInvestigationSizeSuccessType,
  payload: {
    id: investigationId,
    size,
  },
});

export const fetchInvestigationSizeFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationSizeFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationSize = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationSizeRequest());

    // Make use of the facility name and download API url for the request.
    const { facilityName } = getState().dgcommon;
    const { downloadApiUrl } = getState().dgcommon.urls;
    const currentCache = getState().dgcommon.investigationCache[
      investigationId
    ];

    // Check for a cached investigation size in the investigationCache.
    if (currentCache && currentCache.childEntitySize) {
      // Dispatch success using the cached dataset size.
      dispatch(
        fetchInvestigationSizeSuccess(
          investigationId,
          currentCache.childEntitySize
        )
      );
    } else {
      await axios
        .get(`${downloadApiUrl}/user/getSize`, {
          params: {
            sessionId: readSciGatewayToken().sessionId,
            facilityName: facilityName,
            entityType: 'investigation',
            entityId: investigationId,
          },
        })
        .then((response) => {
          dispatch(
            fetchInvestigationSizeSuccess(investigationId, response.data)
          );
        })
        .catch((error) => {
          handleICATError(error, false);
          dispatch(fetchInvestigationSizeFailure(error.message));
        });
    }
  };
};

interface FetchInvestigationsParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  getDatasetCount?: boolean;
  getSize?: boolean;
  offsetParams?: IndexRange;
}

export const fetchInvestigations = (
  optionalParams?: FetchInvestigationsParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    const params = getApiFilter(getState);
    if (optionalParams && optionalParams.offsetParams) {
      params.append(
        'skip',
        JSON.stringify(optionalParams.offsetParams.startIndex)
      );
      params.append(
        'limit',
        JSON.stringify(
          optionalParams.offsetParams.stopIndex -
            optionalParams.offsetParams.startIndex +
            1
        )
      );
    }
    const { apiUrl } = getState().dgcommon.urls;

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));
        if (optionalParams) {
          if (optionalParams.getDatasetCount) {
            batch(() => {
              response.data.forEach((investigation: Investigation) => {
                dispatch(fetchInvestigationDatasetsCount(investigation.id));
              });
            });
          }
          if (optionalParams.getSize) {
            batch(() => {
              response.data.forEach((investigation: Investigation) => {
                dispatch(fetchInvestigationSize(investigation.id));
              });
            });
          }
        }
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

export const fetchISISInvestigations = ({
  instrumentId,
  facilityCycleId,
  offsetParams,
  optionalParams,
}: {
  instrumentId: number;
  facilityCycleId: number;
  offsetParams?: IndexRange;
  optionalParams?: FetchInvestigationsParams;
}): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    const params = getApiFilter(getState);

    let includeParams = [
      { investigationInstruments: 'instrument' },
      { studyInvestigations: 'study' },
    ];

    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach((filter) => {
        if (filter.filterType === 'include') {
          const additionalIncludeParams = JSON.parse(filter.filterValue);
          if (Array.isArray(additionalIncludeParams)) {
            includeParams = includeParams.concat(additionalIncludeParams);
          } else {
            includeParams.push(additionalIncludeParams);
          }
        } else {
          params.append(filter.filterType, filter.filterValue);
        }
      });
    }
    params.append('include', JSON.stringify(includeParams));

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(
        `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations`,
        {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
        }
      )
      .then((response) => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));

        // Once investigation has been fetched successfully,
        // we can issue request to fetch the size.
        if (optionalParams && optionalParams.getSize) {
          batch(() => {
            response.data.forEach((investigation: Investigation) => {
              dispatch(fetchInvestigationSize(investigation.id));
            });
          });
        }
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

export const fetchInvestigationDetailsSuccess = (
  investigations: Investigation[]
): ActionType<FetchDetailsSuccessPayload> => ({
  type: FetchInvestigationDetailsSuccessType,
  payload: {
    data: investigations,
  },
});

export const fetchInvestigationDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchInvestigationCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchInvestigationCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationCountFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationDetailsRequest = (): Action => ({
  type: FetchInvestigationDetailsRequestType,
});

export const fetchInvestigationDetails = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationDetailsRequest());

    const params = new URLSearchParams();

    params.append('where', JSON.stringify({ id: { eq: investigationId } }));
    params.append(
      'include',
      JSON.stringify([
        { investigationUsers: 'user' },
        'samples',
        'publications',
      ])
    );

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchInvestigationDetailsSuccess(response.data));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchInvestigationDetailsFailure(error.message));
      });
  };
};

export const fetchInvestigationCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationCount = (
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationCountRequest(timestamp));

    const params = getApiFilter(getState);

    if (additionalFilters) {
      additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    params.delete('order');

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/investigations/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(fetchInvestigationCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchInvestigationCountFailure(error.message));
      });
  };
};

export const fetchISISInvestigationCount = (
  instrumentId: number,
  facilityCycleId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationCountRequest(timestamp));

    const params = getApiFilter(getState);
    params.delete('order');

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(
        `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations/count`,
        {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
        }
      )
      .then((response) => {
        dispatch(fetchInvestigationCountSuccess(response.data, timestamp));
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchInvestigationCountFailure(error.message));
      });
  };
};

export const fetchFilterRequest = (): Action => ({
  type: FetchFilterRequestType,
});

export const fetchFilterSuccess = (
  filterKey: string,
  filterData: string[]
): ActionType<FetchFilterSuccessPayload> => ({
  type: FetchFilterSuccessType,
  payload: {
    filterKey,
    data: filterData,
  },
});

export const fetchFilterFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchFilterFailureType,
  payload: {
    error,
  },
});

export const fetchFilter = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  filterKey: string,
  additionalFilters?: {
    filterType: 'where' | 'distinct' | 'include';
    filterValue: string;
  }[],
  // NOTE: Support for nested values by providing a dataKey for API request
  //       which differs from filter key used in code.
  dataKey?: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchFilterRequest());

    const params = new URLSearchParams();
    // Allow for other additional filters to be applied.
    if (additionalFilters) {
      additionalFilters.forEach((filter) => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    // Add in the distinct if it as not already been added.
    const distinctFilterString = params.get('distinct');
    // Use the dataKey if provided, this allows for nested items
    // to be read as requesting them from the API maybe in a different format.
    // i.e. investigationInstruments[0].instrument maybe requested as investigationInstruments.instrument
    const filterValue = dataKey ? dataKey : filterKey;
    if (distinctFilterString) {
      const distinctFilter: string | string[] = JSON.parse(
        distinctFilterString
      );
      if (typeof distinctFilter === 'string') {
        params.set('distinct', JSON.stringify([distinctFilter, filterValue]));
      } else {
        params.set(
          'distinct',
          JSON.stringify([...distinctFilter, filterValue])
        );
      }
    } else {
      params.set('distinct', JSON.stringify(filterValue));
    }

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get<Entity[]>(`${apiUrl}/${entityType}s`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        dispatch(
          fetchFilterSuccess(
            filterKey,
            response.data.map((x) => nestedValue(x, filterKey))
          )
        );
      })
      .catch((error) => {
        handleICATError(error);
        dispatch(fetchFilterFailure(error.message));
      });
  };
};
