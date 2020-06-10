import axios, { AxiosResponse } from 'axios';
import {
  handleICATError,
  Dataset,
  Investigation,
  ConfigureURLsType,
  readSciGatewayToken,
} from 'datagateway-common';
import { Middleware, Dispatch, AnyAction } from 'redux';

let apiUrl = '';

// this is so that idCheckFunctions have access to the apiUrl
export const saveApiUrlMiddleware: Middleware = (() => (
  next: Dispatch<AnyAction>
) => (action: AnyAction): AnyAction => {
  if (action.type === ConfigureURLsType) {
    apiUrl = action.payload.urls.apiUrl;
  }

  return next(action);
}) as Middleware;

export const checkInvestigationId = (
  investigationId: number,
  datasetId: number
): Promise<boolean> => {
  return axios
    .get(`${apiUrl}/datasets/${datasetId}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Dataset>) => {
      return response.data.INVESTIGATION_ID === investigationId;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkInstrumentAndFacilityCycleId = (
  instrumentId: number,
  facilityCycleId: number,
  investigationId: number
): Promise<boolean> => {
  return axios
    .get(
      `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations/`,
      {
        params: {
          where: {
            ID: {
              eq: investigationId,
            },
          },
        },
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      }
    )
    .then((response: AxiosResponse<Investigation[]>) => {
      return response.data.length > 0;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkProposalName = (
  proposalName: string,
  investigationId: number
): Promise<boolean> => {
  return axios
    .get(`${apiUrl}/investigations/${investigationId}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Investigation>) => {
      return response.data.NAME === proposalName;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};
