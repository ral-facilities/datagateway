import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import log from 'loglevel';
import { useSelector } from 'react-redux';
import {
  BioPortalTerm,
  DOIDraftVersionResponse,
  DOIIdentifierType,
  DOIMetadata,
  DOIResponse,
  DataCiteDOI,
  DataCiteResponse,
  DownloadCartItem,
  MicroFrontendId,
  RelatedIdentifier,
  User,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import {
  InvalidateTokenType,
  NotificationType,
} from '../state/actions/actions.types';
import { StateType } from '../state/app.types';

export const handleDOIAPIError = (
  error: AxiosError<{
    detail: { msg: string }[] | string;
  }>,
  logCondition?: boolean,
  broadcastCondition?: boolean
): void => {
  const message = error.response?.data?.detail
    ? typeof error.response.data.detail === 'string'
      ? error.response.data.detail
      : error.response.data.detail[0].msg
    : error.message;

  if (typeof logCondition === 'undefined' || logCondition === true)
    log.error(message);

  if (broadcastCondition === true) {
    let broadcastMessage = message;
    // no reponse so it's a network error
    if (!error.response)
      broadcastMessage =
        'Network Error, please reload the page or try again later';
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message: broadcastMessage,
          },
        },
      })
    );
  }

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
): Promise<User> => {
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
) => {
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();
  const retries =
    typeof opts?.queries?.retry === 'number' ? opts.queries.retry : 3;

  return useQuery({
    queryKey: ['checkUser', username, doiMinterUrl],
    queryFn: () => checkUser(username, doiMinterUrl),
    meta: { icatError: true },
    retry: (failureCount: number, error: AxiosError) => {
      if (
        // user not logged in, error code will log them out
        error.response?.status === 401 ||
        // email doesn't match user - don't retry as this is a correct response from the server
        error.response?.status === 404 ||
        // email is invalid - don't retry as this is correct response from the server
        error.response?.status === 422 ||
        failureCount >= retries
      )
        return false;
      return true;
    },
    // set enabled false to only fetch on demand when the add creator button is pressed
    enabled: false,
    gcTime: 0, // TODO: is this really supposed to be cacheTime or is it supposed to be staleTime?
  });
};

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
 * Returns the DOI metadata for a DOI
 * @param doi The DOI that we're checking
 * @returns the {@link DataCiteDOI} record that matches the DOI
 */
export const useDOI = (
  doi: string | undefined
): UseQueryResult<DataCiteDOI, AxiosError> => {
  const dataCiteUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.dataCiteUrl
  );
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();
  const retries =
    typeof opts?.queries?.retry === 'number' ? opts.queries.retry : 3;

  return useQuery({
    queryKey: ['doi', doi, dataCiteUrl],
    queryFn: () => fetchDOI(doi ?? '', dataCiteUrl),
    retry: (failureCount: number, error: AxiosError) => {
      if (
        // DOI is invalid - don't retry as this is a correct response from the server
        error.response?.status === 404 ||
        failureCount >= retries
      )
        return false;
      return true;
    },
    enabled: typeof doi !== 'undefined',
  });
};

/**
 * Checks whether a DOI is valid and returns the DOI metadata
 * @param doi The DOI that we're checking
 * @returns the {@link RelatedIdentifier} that matches the username, or 404
 */
export const useCheckDOI = (doi: string, dataCiteUrl: string | undefined) => {
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();
  const retries =
    typeof opts?.queries?.retry === 'number' ? opts.queries.retry : 3;

  return useQuery({
    queryKey: ['checkDOI', doi, dataCiteUrl],
    queryFn: () => fetchDOI(doi, dataCiteUrl),
    retry: (failureCount: number, error: AxiosError) => {
      if (
        // DOI is invalid - don't retry as this is a correct response from the server
        error.response?.status === 404 ||
        failureCount >= retries
      )
        return false;
      return true;
    },
    select: (doi) =>
      ({
        title: doi.attributes.titles[0].title,
        identifier: doi.attributes.doi,
        relatedIdentifierType: DOIIdentifierType.DOI,
        relationType: '',
      }) satisfies RelatedIdentifier as RelatedIdentifier,
    // set enabled false to only fetch on demand when the add creator button is pressed
    enabled: false,
    gcTime: 0, // TODO: is this really supposed to be cacheTime or is it supposed to be staleTime?
  });
};

/**
 * Create a draft of a new version DOI based on an existing concept DOI
 * @param conceptDataPublicationId The concept DataPublication to update
 * @param content The updated contents
 * @param doiMetadata The updated metadata
 */
export const draftVersionDOI = (
  conceptDataPublicationId: string,
  content: {
    investigation_ids: number[];
    dataset_ids: number[];
    datafile_ids: number[];
  },
  doiMetadata: DOIMetadata,
  doiMinterUrl: string | undefined
): Promise<DOIDraftVersionResponse> => {
  return axios
    .post(
      `${doiMinterUrl}/draft/${conceptDataPublicationId}/version`,
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
export const useDraftVersionDOI = () => {
  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );

  return useMutation({
    mutationFn: ({
      contentDataPublicationId,
      content,
      doiMetadata,
    }: {
      contentDataPublicationId: string;
      content: {
        investigation_ids: number[];
        dataset_ids: number[];
        datafile_ids: number[];
      };
      doiMetadata: DOIMetadata;
    }) => {
      return draftVersionDOI(
        contentDataPublicationId,
        content,
        doiMetadata,
        doiMinterUrl
      );
    },

    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

/**
 * Publish a draft version DOI, returns a DataPublication ID & DOI
 */
export const publishDraftVersionDOI = (
  contentDataPublicationId: string,
  draftVersionDataPublicationId: string,
  doiMinterUrl: string | undefined
): Promise<DOIResponse> => {
  return axios
    .put(
      `${doiMinterUrl}/draft/${contentDataPublicationId}/version/${draftVersionDataPublicationId}/publish`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      }
    )
    .then((response) => response.data);
};

type UsePublishDraftVersionVariables = {
  contentDataPublicationId: string;
  draftVersionDataPublicationId: string;
};

/**
 * Publishes a draft data publication
 * @param dataPublicationId The {@link DataPublication} to publish
 */
export const usePublishDraftVersion = () => {
  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );
  const username = readSciGatewayToken().username;

  return useMutation({
    mutationFn: ({
      contentDataPublicationId,
      draftVersionDataPublicationId,
    }: UsePublishDraftVersionVariables) =>
      publishDraftVersionDOI(
        contentDataPublicationId,
        draftVersionDataPublicationId,
        doiMinterUrl
      ),
    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
    onSuccess: (
      data,
      { contentDataPublicationId }: UsePublishDraftVersionVariables,
      _onMutateResult,
      context
    ) => {
      // resetQueries instead of invalidateQueries as otherwise invalidateQueries shows out-of-date data
      context.client.resetQueries({
        predicate: (query) =>
          // invalidate the my DOIs page query
          (query.queryKey[0] === 'dataPublication' &&
            username !== null &&
            typeof query.queryKey[2] !== 'undefined' &&
            JSON.stringify(query.queryKey[2]).includes(username) &&
            JSON.stringify(query.queryKey[2]).includes('User-defined')) ||
          // invalidate the data publication info query
          (query.queryKey[0] === 'dataPublication' &&
            typeof query.queryKey[1] !== 'undefined' &&
            JSON.stringify(query.queryKey[1]).includes(
              contentDataPublicationId
            )) ||
          // invalidate the data publication datacite info query
          (query.queryKey[0] === 'doi' &&
            typeof query.queryKey[1] !== 'undefined' &&
            JSON.stringify(query.queryKey[1]).includes(
              data.concept.attributes.doi
            )) ||
          // invalidate the data publication content table queries
          (query.queryKey[0] === 'dataPublicationContent' &&
            // use double equals to ignore difference between 1 and "1"

            query.queryKey[2] == contentDataPublicationId) ||
          (query.queryKey[0] === 'dataPublicationContentCount' &&
            query.queryKey[2] == contentDataPublicationId),
      });
    },
  });
};

/**
 * Delete a draft version DOI
 */
export const deleteDraftVersionDOI = (
  contentDataPublicationId: string,
  draftVersionDataPublicationId: string,
  doiMinterUrl: string | undefined
): Promise<void> => {
  return axios.delete(
    `${doiMinterUrl}/draft/${contentDataPublicationId}/version/${draftVersionDataPublicationId}`,
    {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    }
  );
};

/**
 * Deletes a draft version data publication
 * @param dataPublicationId The {@link DataPublication} to publish
 */
export const useDeleteDraftVersion = () => {
  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );

  return useMutation({
    mutationFn: ({
      contentDataPublicationId,
      draftVersionDataPublicationId,
    }: UsePublishDraftVersionVariables) => {
      return deleteDraftVersionDOI(
        contentDataPublicationId,
        draftVersionDataPublicationId,
        doiMinterUrl
      );
    },

    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

/**
 * Returns true if a user is able to mint a DOI for their cart, otherwise false
 */
export const isCartMintable = async (
  cart: DownloadCartItem[],
  doiMinterUrl: string
): Promise<boolean> => {
  const investigations: number[] = [];
  const datasets: number[] = [];
  const datafiles: number[] = [];
  cart.forEach((cartItem) => {
    if (cartItem.entityType === 'investigation')
      investigations.push(cartItem.entityId);
    if (cartItem.entityType === 'dataset') datasets.push(cartItem.entityId);
    if (cartItem.entityType === 'datafile') datafiles.push(cartItem.entityId);
  });

  const { status } = await axios.post(
    `${doiMinterUrl}/ismintable`,
    {
      ...(investigations.length > 0
        ? { investigation_ids: investigations }
        : {}),
      ...(datasets.length > 0 ? { dataset_ids: datasets } : {}),
      ...(datafiles.length > 0 ? { datafile_ids: datafiles } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    }
  );

  return status === 200;
};

// these are "expected" errors i.e. user not a PI or no session DOI
export const isMintabilityErrorExpected = (
  error: AxiosError<{
    detail: { msg: string }[] | string;
  }>
): boolean => {
  return (
    error.response?.status === 403 ||
    (error.response?.status === 400 &&
    typeof error.response?.data?.detail === 'string'
      ? error.response.data.detail.includes('session DOI')
      : false)
  );
};

/**
 * Queries whether a cart is mintable.
 * @param cart The {@link Cart} that is checked
 */
export const useIsCartMintable = (
  cart: DownloadCartItem[] | undefined,
  doiMinterUrl: string | undefined
): UseQueryResult<
  boolean,
  AxiosError<{
    detail: { msg: string }[] | string;
  }>
> => {
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();
  const retries =
    typeof opts?.queries?.retry === 'number' ? opts.queries.retry : 3;

  return useQuery({
    queryKey: ['ismintable', cart, doiMinterUrl],
    queryFn: () => {
      if (doiMinterUrl && cart && cart.length > 0)
        return isCartMintable(cart, doiMinterUrl);
      else return Promise.resolve(false);
    },
    meta: {
      DOIAPIError: true,
      // don't broadcast or log "expected" errors
      broadcastCondition: (error) =>
        !isMintabilityErrorExpected(
          error as AxiosError<{
            detail: { msg: string }[] | string;
          }>
        ),
      logCondition: (error) =>
        !isMintabilityErrorExpected(
          error as AxiosError<{
            detail: { msg: string }[] | string;
          }>
        ),
    },
    retry: (failureCount, error) => {
      // don't bother retrying "expected" errors - all other errors use default retry behaviour
      if (isMintabilityErrorExpected(error) || failureCount >= retries) {
        return false;
      } else {
        return true;
      }
    },
    refetchOnWindowFocus: false,
    enabled: typeof doiMinterUrl !== 'undefined',
  });
};

export const openDataPublication: (
  dataPublicationId: string,
  doiMinterUrl: string | undefined
) => Promise<void> = (dataPublicationId, doiMinterUrl) => {
  return axios.put(
    `${doiMinterUrl}/open/${dataPublicationId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    }
  );
};

/**
 * A React hook for opening a session DOI.
 */
export const useOpenDataPublication = () => {
  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );
  return useMutation({
    mutationFn: ({ dataPublicationId }: { dataPublicationId: string }) =>
      openDataPublication(dataPublicationId, doiMinterUrl),

    onError: (
      error: AxiosError<{
        detail: { msg: string }[] | string;
      }>
    ) => {
      handleDOIAPIError(error, true, true);
    },
  });
};

export interface BioPortalResponse {
  page: number;
  pageCount: number;
  totalCount: number;
  prevPage: number | null;
  nextPage: number | null;
  links: {
    nextPage: string | null;
    prevPage: string | null;
  };
  collection: BioPortalTerm[];
}

/**
 * Fetch list of PANET techniques matching the search text
 * @param searchText The text to filter techniques by
 */
export const fetchPANETTechniquesFromSearchText = (
  searchText: string,
  bioportalUrl: string | undefined
): Promise<BioPortalTerm[]> => {
  return axios
    .get<BioPortalResponse>(
      `${bioportalUrl}/search?ontology=PANET&subtree_root_id=http://purl.org/pan-science/PaNET/PaNET00001&include=prefLabel,synonym${
        searchText.length === 0 ? '' : '&suggest=true'
      }&q=${searchText}&pagesize=500&format=json&display_context=false`
    )
    .then((response) => {
      return response.data.collection;
    });
};

/**
 * Fetch descendants using the parent's descendants URL
 * @param descendantsUrl The URL to query
 */
export const fetchDescendantPANETTechniques = (
  descendantsUrl: string,
  bioportalUrl: string | undefined
): Promise<BioPortalTerm[]> => {
  const descendantsPath = new URL(descendantsUrl).pathname;
  return axios
    .get<
      BioPortalResponse | never[]
    >(`${bioportalUrl}${descendantsPath}?pagesize=500&format=json&include=prefLabel,synonym&display_context=false`)
    .then((response) => {
      return 'collection' in response.data ? response.data.collection : [];
    });
};

/**
 * Searches the PANET ontology for techniques matching the search term
 * @param doi The DOI that we're checking
 * @returns a list of PANET techniques that matches the search text
 */
export const useSearchPANETTechniques = (
  searchText: string,
  bioportalUrl: string | undefined
): UseQueryResult<BioPortalTerm[], AxiosError> => {
  return useQuery({
    queryKey: ['SearchPANETTechniques', searchText, bioportalUrl],
    queryFn: () => fetchPANETTechniquesFromSearchText(searchText, bioportalUrl),
    staleTime: Infinity,
    enabled: typeof bioportalUrl !== 'undefined',
  });
};

/**
 * Gets the descendant techniques for a specified PANET technique
 * @param selectedTechnique The technique that we want to find the descendants of
 * @returns the child techniques of the specified parent
 */
export const useGetDescendantTechniques = (
  selectedTechnique: BioPortalTerm | null,
  bioportalUrl: string | undefined
): UseQueryResult<BioPortalTerm[], AxiosError> => {
  return useQuery({
    queryKey: ['getDescendantTechniques', selectedTechnique, bioportalUrl],
    queryFn: () =>
      selectedTechnique
        ? fetchDescendantPANETTechniques(
            selectedTechnique?.links.descendants,
            bioportalUrl
          )
        : Promise.resolve([]),
    staleTime: Infinity,
    enabled: selectedTechnique !== null && typeof bioportalUrl !== 'undefined',
  });
};
