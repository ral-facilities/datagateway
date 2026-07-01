import axios, { AxiosResponse } from 'axios';
import {
  BroadcastSignOutType,
  ConfigureURLsType,
  Investigation,
  MicroFrontendId,
  handleICATError,
  readSciGatewayToken,
} from 'datagateway-common';
import memoize from 'lodash.memoize';
import { AnyAction, Dispatch, Middleware } from 'redux';

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

const unmemoizedCheckStudyDataPublicationId = (
  studyDataPublicationId: number,
  investigationDataPublicationId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      id: { eq: investigationDataPublicationId },
    })
  );
  params.append(
    'where',
    JSON.stringify({
      'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
        {
          eq: studyDataPublicationId,
        },
    })
  );
  return axios
    .get(`${apiUrl}/datapublications`, {
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

export const checkStudyDataPublicationId = memoize(
  unmemoizedCheckStudyDataPublicationId,
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

const unmemoizedCheckProposalName = (
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

const unmemoizedCheckDatasetId = (
  datasetId: number,
  datafileId: number
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append(
    'where',
    JSON.stringify({
      id: {
        eq: datafileId,
      },
    })
  );
  params.append('where', JSON.stringify({ 'dataset.id': { eq: datasetId } }));
  return axios
    .get(`${apiUrl}/datafiles/findone`, {
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

export const checkDatasetId = memoize(unmemoizedCheckDatasetId, (...args) =>
  JSON.stringify(args)
);

// clear caches when the user signs out - prepares for if they sign in as a different user. E.g. anon -> authenticated
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  if (action.type === BroadcastSignOutType) {
    checkDatasetId.cache.clear?.();
    checkProposalName.cache.clear?.();
    checkInstrumentId.cache.clear?.();
    checkStudyDataPublicationId.cache.clear?.();
    checkInstrumentAndFacilityCycleId.cache.clear?.();
    checkInvestigationId.cache.clear?.();
  }
});
