import axios, { AxiosResponse } from 'axios';
import { handleICATError, Dataset, Investigation } from 'datagateway-common';

let apiUrl = '';

export function setApiUrl(newApiUrl: string): void {
  apiUrl = newApiUrl;
}

export const checkInvestigationId = (
  investigationId: number,
  datasetId: number
): Promise<boolean> => {
  return axios
    .get(`${apiUrl}/datasets/${datasetId}`, {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
      },
    })
    .then((response: AxiosResponse<Dataset>) => {
      return response.data.INVESTIGATION_ID === investigationId;
    })
    .catch(error => {
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
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      }
    )
    .then((response: AxiosResponse<Investigation[]>) => {
      return response.data.length > 0;
    })
    .catch(error => {
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
        Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
      },
    })
    .then((response: AxiosResponse<Investigation>) => {
      return response.data.NAME === proposalName;
    })
    .catch(error => {
      handleICATError(error);
      return false;
    });
};
