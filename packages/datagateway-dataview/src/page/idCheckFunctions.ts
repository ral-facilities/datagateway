import axios, { AxiosResponse } from 'axios';
import {
  handleICATError,
  Investigation,
  Dataset,
  Datafile,
  ConfigureURLsType,
  readSciGatewayToken,
} from 'datagateway-common';
import { Middleware, Dispatch, AnyAction } from 'redux';
import memoize from 'lodash.memoize';

let apiUrl = '';

// this is so that idCheckFunctions have access to the apiUrl
export const saveApiUrlMiddleware: Middleware = (() =>
  (next: Dispatch<AnyAction>) =>
  (action: AnyAction): AnyAction => {
    if (action.type === ConfigureURLsType) {
      apiUrl = action.payload.urls.apiUrl;
    }

    return next(action);
  }) as Middleware;

const unmemoizedCheckInvestigationId = (
  investigationId: number,
  datasetId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      id: {
        eq: datasetId,
      },
    })
  );
  params.append(
    'where',
    JSON.stringify({ 'investigation.id': { eq: investigationId } })
  );
  return axios
    .get(`${apiUrl}/datasets/findone`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then(() => {
      return true;
    })
    .catch((error) => {
      // 404 is valid response from API saying the investigation id is invalid
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return false;
      // handle other API errors
      handleICATError(error);
      return false;
    });
};

// we memoize so that we "remember" past promises so we don't redo to
// improves performance if a user revisits a specific view.
// However, depending on how users use the software, this
// may cause a memory leak since the cache size is infinite. In that case,
// we'd have to create our own memoize function with a cache limit
export const checkInvestigationId = memoize(
  unmemoizedCheckInvestigationId,
  (...args) => JSON.stringify(args)
);

const unmemoizedCheckInstrumentAndFacilityCycleId = (
  instrumentId: number,
  facilityCycleId: number,
  investigationId: number
): Promise<boolean> => {
  return axios
    .get(`${apiUrl}/investigations`, {
      params: {
        where: JSON.stringify({
          id: {
            eq: investigationId,
          },
          investigationInstrument: { instrument: { id: { eq: instrumentId } } },
          investigationFacilityCycle: {
            facilityCycle: { id: { eq: facilityCycleId } },
          },
        }),
      },
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Investigation[]>) => {
      return response.data.length > 0;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkInstrumentAndFacilityCycleId = memoize(
  unmemoizedCheckInstrumentAndFacilityCycleId,
  (...args) => JSON.stringify(args)
);

const unmemoizedCheckDataPublicationId = (
  dataPublicationId: number,
  investigationId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      id: { eq: investigationId },
    })
  );
  params.append(
    'where',
    JSON.stringify({
      'dataCollectionInvestigations.dataCollection.dataPublications.id': {
        eq: dataPublicationId,
      },
    })
  );
  return axios
    .get(`${apiUrl}/investigations/`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Investigation[]>) => {
      return response.data.length > 0;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkDataPublicationId = memoize(
  unmemoizedCheckDataPublicationId,
  (...args) => JSON.stringify(args)
);

const unmemoizedCheckInstrumentId = (
  instrumentId: number,
  dataPublicationId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      id: { eq: dataPublicationId },
    })
  );
  params.append(
    'where',
    JSON.stringify({
      'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
        {
          eq: instrumentId,
        },
    })
  );
  return axios
    .get(`${apiUrl}/datapublications/`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Investigation[]>) => {
      return response.data.length > 0;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkInstrumentId = memoize(
  unmemoizedCheckInstrumentId,
  (...args) => JSON.stringify(args)
);

export const unmemoizedCheckProposalName = (
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
      return response.data.name === proposalName;
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });
};

export const checkProposalName = memoize(
  unmemoizedCheckProposalName,
  (...args) => JSON.stringify(args)
);

export const unmemoizedCheckDatafileId = (
  investigationId: Investigation['id'],
  datasetId: Dataset['id'],
  datafileId: Datafile['id']
): Promise<boolean> =>
  axios
    .get(`${apiUrl}/datafiles`, {
      params: {
        include: JSON.stringify(['dataset', 'dataset.investigation']),
        where: JSON.stringify({ id: { eq: datafileId } }),
      },
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response: AxiosResponse<Datafile[]>) => {
      if (response.data.length <= 0) return false;
      const datafile = response.data[0];
      return (
        datafile.id === datafileId &&
        datafile.dataset?.id === datasetId &&
        datafile.dataset?.investigation?.id === investigationId
      );
    })
    .catch((error) => {
      handleICATError(error);
      return false;
    });

export const checkDatafileId = memoize(unmemoizedCheckDatafileId, (...args) =>
  JSON.stringify(args)
);
