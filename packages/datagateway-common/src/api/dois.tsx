import axios, { AxiosError } from 'axios';
import log from 'loglevel';
import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
} from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';
import { InvalidateTokenType } from '../state/actions/actions.types';
import {
  User,
  MicroFrontendId,
  RelatedDOI,
  DoiMetadata,
  DoiResponse,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';

export const handleDOIAPIError = (
  // one hook complains if we use unknown, another complains if we use never
  // so just use any - we never access the custom error payload anyway
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: AxiosError<any>,
  variables?: unknown,
  context?: unknown,
  logCondition?: boolean
): void => {
  if (typeof logCondition === 'undefined' || logCondition === true)
    log.error(error);
  if (error.response?.status === 401) {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: InvalidateTokenType,
          payload: {
            severity: 'error',
            message:
              localStorage.getItem('autoLogin') === 'true'
                ? 'Your session has expired, please reload the page'
                : 'Your session has expired, please login again',
          },
        },
      })
    );
  }
};

/**
 * Sends an username to the API and it checks if it's a valid ICAT User, on success
 * it returns the User, on failure it returns 404
 */
export const checkUser = (
  username: string,
  doiMinterUrl: string | undefined
): Promise<User | AxiosError> => {
  return axios
    .get(`${doiMinterUrl}/user/${username}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

/**
 * Checks whether a username belongs to an ICAT User
 * @param username The username that we're checking
 * @returns the {@link User} that matches the username, or 404
 */
export const useCheckUser = (
  username: string,
  doiMinterUrl: string | undefined
): UseQueryResult<User, AxiosError> => {
  return useQuery(
    ['checkUser', username],
    () => checkUser(username, doiMinterUrl),
    {
      onError: handleDOIAPIError,
      retry: (failureCount: number, error: AxiosError) => {
        if (
          // user not logged in, error code will log them out
          error.response?.status === 401 ||
          // email doesn't match user - don't retry as this is a correct response from the server
          error.response?.status === 404 ||
          // email is invalid - don't retry as this is correct response from the server
          error.response?.status === 422 ||
          failureCount >= 3
        )
          return false;
        return true;
      },
      // set enabled false to only fetch on demand when the add creator button is pressed
      enabled: false,
      cacheTime: 0,
    }
  );
};

interface DataCiteResponse {
  data: DataCiteDOI;
}

export interface DataCiteDOI {
  id: string;
  type: string;
  attributes: {
    doi: string;
    titles: { title: string }[];
    url: string;
  };
}

/**
 * Retrieve metadata for a DOI
 * @param doi The DOI to fetch metadata for
 */
export const fetchDOI = (
  doi: string,
  dataCiteUrl: string | undefined
): Promise<DataCiteDOI> => {
  return axios
    .get<DataCiteResponse>(`${dataCiteUrl}/dois/${doi}`)
    .then((response) => {
      return response.data.data;
    });
};

/**
 * Checks whether a DOI is valid and returns the DOI metadata
 * @param doi The DOI that we're checking
 * @returns the {@link RelatedDOI} that matches the username, or 404
 */
export const useCheckDOI = (
  doi: string,
  dataCiteUrl: string | undefined
): UseQueryResult<RelatedDOI, AxiosError> => {
  return useQuery(['checkDOI', doi], () => fetchDOI(doi, dataCiteUrl), {
    retry: (failureCount: number, error: AxiosError) => {
      if (
        // DOI is invalid - don't retry as this is a correct response from the server
        error.response?.status === 404 ||
        failureCount >= 3
      )
        return false;
      return true;
    },
    select: (doi) => ({
      title: doi.attributes.titles[0].title,
      identifier: doi.attributes.doi,
      fullReference: '', // TODO: what should we put here?
      relationType: '',
      relatedItemType: '',
    }),
    // set enabled false to only fetch on demand when the add creator button is pressed
    enabled: false,
    cacheTime: 0,
  });
};

/**
 * Update a datapublication
 * @param dataPublicationId The DataPublication to update
 * @param cart The DataPublication to update
 * @param doiMetadata The DataPublication to update
 */
export const updateDOI = (
  dataPublicationId: string,
  content: {
    investigation_ids: number[];
    dataset_ids: number[];
    datafile_ids: number[];
  },
  doiMetadata: DoiMetadata,
  doiMinterUrl: string | undefined
): Promise<DoiResponse> => {
  return axios
    .put(
      `${doiMinterUrl}/mint/version/update/${dataPublicationId}`,
      {
        metadata: {
          ...doiMetadata,
          resource_type:
            content.investigation_ids.length === 0 ? 'Dataset' : 'Collection',
        },
        ...content,
      },
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      }
    )
    .then((response) => response.data);
};

/**
 * Updates a datapublication
 * @param cart The {@link Cart} to mint
 * @param doiMetadata The required metadata for the DOI
 */
export const useUpdateDOI = (): UseMutationResult<
  DoiResponse,
  AxiosError<{
    detail: { msg: string }[] | string;
  }>,
  {
    dataPublicationId: string;
    content: {
      investigation_ids: number[];
      dataset_ids: number[];
      datafile_ids: number[];
    };
    doiMetadata: DoiMetadata;
  }
> => {
  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );

  return useMutation(
    ({ dataPublicationId, content, doiMetadata }) => {
      return updateDOI(dataPublicationId, content, doiMetadata, doiMinterUrl);
    },
    {
      onError: handleDOIAPIError,
    }
  );
};
