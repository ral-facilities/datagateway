import React from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as log from 'loglevel';
import {
  SubmitCart,
  DownloadCartItem,
  Datafile,
  Download,
  readSciGatewayToken,
  handleICATError,
  fetchDownloadCart,
  removeFromCart,
  DownloadCartTableItem,
} from 'datagateway-common';
import { DownloadSettingsContext } from './ConfigProvider';
import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
  UseQueryOptions,
  useQueries,
} from 'react-query';
import pLimit from 'p-limit';
import useDeepCompareEffect from 'use-deep-compare-effect';

export const useCart = (): UseQueryResult<
  DownloadCartTableItem[],
  AxiosError
> => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;
  return useQuery(
    'cart',
    () =>
      fetchDownloadCart({
        facilityName,
        downloadApiUrl,
      }),
    {
      onError: (error) => {
        handleICATError(error);
      },
      select: (cart): DownloadCartTableItem[] => {
        return cart.map((cartItem) => ({
          ...cartItem,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          size: cartItem.size ?? -1,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          fileCount: cartItem.fileCount ?? -1,
        }));
      },
      staleTime: 0,
    }
  );
};

export const removeAllDownloadCartItems: (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => Promise<DownloadCartItem[]> = (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => {
  return axios.delete(
    `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
    {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        items: '*',
      },
    }
  );
};

export const useRemoveAllFromCart = (): UseMutationResult<
  DownloadCartItem[],
  AxiosError
> => {
  const queryClient = useQueryClient();
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    () => removeAllDownloadCartItems({ facilityName, downloadApiUrl }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', []);
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const useRemoveEntityFromCart = (): UseMutationResult<
  DownloadCartItem[],
  AxiosError,
  { entityId: number; entityType: 'investigation' | 'dataset' | 'datafile' }
> => {
  const queryClient = useQueryClient();
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    ({ entityId, entityType }) =>
      removeFromCart(entityType, [entityId], {
        facilityName,
        downloadApiUrl,
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const getIsTwoLevel: (settings: {
  idsUrl: string;
}) => Promise<boolean> = (settings: { idsUrl: string }) => {
  return axios
    .get<boolean>(`${settings.idsUrl}/isTwoLevel`)
    .then((response) => {
      return response.data;
    });
};

export const useIsTwoLevel = (): UseQueryResult<boolean, AxiosError> => {
  const settings = React.useContext(DownloadSettingsContext);
  const { idsUrl } = settings;
  return useQuery('isTwoLevel', () => getIsTwoLevel({ idsUrl }), {
    onError: (error) => {
      handleICATError(error);
    },
    staleTime: Infinity,
  });
};

export const submitCart: (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  },
  zipType?: 'ZIP' | 'ZIP_AND_COMPRESS'
) => Promise<number> = (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  },
  zipType?: 'ZIP' | 'ZIP_AND_COMPRESS'
) => {
  const params = new URLSearchParams();

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  params.append('fileName', fileName);

  // NOTE: zipType by default is 'ZIP', it can be 'ZIP_AND_COMPRESS'.
  params.append('zipType', zipType ? zipType : 'ZIP');

  return axios
    .post<SubmitCart>(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/submit`,
      params
    )
    .then((response) => {
      log.debug(response);

      // Get the downloadId that was returned from the IDS server.
      const downloadId = response.data['downloadId'];
      return downloadId;
    });
};

export const useSubmitCart = (): UseMutationResult<
  number,
  AxiosError,
  {
    transport: string;
    emailAddress: string;
    fileName: string;
    zipType?: 'ZIP' | 'ZIP_AND_COMPRESS';
  }
> => {
  const queryClient = useQueryClient();
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, downloadApiUrl } = settings;

  return useMutation(
    ({ transport, emailAddress, fileName, zipType }) =>
      submitCart(
        transport,
        emailAddress,
        fileName,
        {
          facilityName,
          downloadApiUrl,
        },
        zipType
      ),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

export const fetchDownloads: (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => Promise<Download[]> = (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      handleICATError(error);
      return [];
    });
};

export const fetchAdminDownloads: (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => Promise<Download[]> = (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/admin/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      handleICATError(error);
      return [];
    });
};

export const getDownload: (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<Download | null> = (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then((response) => {
      const download = response.data[0];
      return download;
    })
    .catch((error) => {
      handleICATError(error);
      return null;
    });
};

export const downloadPreparedCart: (
  preparedId: string,
  fileName: string,
  settings: { idsUrl: string }
) => void = (
  preparedId: string,
  fileName: string,
  settings: { idsUrl: string }
) => {
  // Create our IDS link from the query parameters.
  const link = document.createElement('a');
  link.href = getDataUrl(preparedId, fileName, settings.idsUrl);

  // We trigger an immediate download which will begin in a new tab.
  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);

  // Prevent the link from being clicked if this is an e2e test.
  if (!process.env.REACT_APP_E2E_TESTING) {
    link.click();
    link.remove();
  }
};

export const getDownloadTypeStatus: (
  transportType: string,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<{ disabled: boolean; message: string } | null> = (
  transportType: string,
  settings: { facilityName: string; downloadApiUrl: string }
) => {
  return axios
    .get(
      `${settings.downloadApiUrl}/user/downloadType/${transportType}/status`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
        },
      }
    )
    .then(
      (
        response: AxiosResponse<{
          disabled: boolean;
          message: string;
        }>
      ) => {
        return response.data;
      }
    )
    .catch((error) => {
      if (error) handleICATError(error);
      return null;
    });
};

export const downloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', JSON.stringify(deleted));

  return axios
    .put(
      `${settings.downloadApiUrl}/user/download/${downloadId}/isDeleted`,
      params
    )
    .then(() => {
      // do nothing
    })
    .catch((error) => {
      handleICATError(error);
    });
};

export const adminDownloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', JSON.stringify(deleted));

  return axios
    .put(
      `${settings.downloadApiUrl}/admin/download/${downloadId}/isDeleted`,
      params
    )
    .then(() => {
      // do nothing
    })
    .catch((error) => {
      handleICATError(error);
    });
};

export const adminDownloadStatus: (
  downloadId: number,
  status: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  status: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', status);

  return axios
    .put(
      `${settings.downloadApiUrl}/admin/download/${downloadId}/status`,
      params
    )
    .then(() => {
      // do nothing
    })
    .catch((error) => {
      handleICATError(error);
    });
};

export const getSize: (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => {
  if (entityType === 'datafile') {
    return axios
      .get<Datafile>(`${settings.apiUrl}/datafiles/${entityId}`, {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        const size = response.data['fileSize'] as number;
        return size;
      });
  } else {
    return axios
      .get<number>(`${settings.downloadApiUrl}/user/getSize`, {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
          entityType: entityType,
          entityId: entityId,
        },
      })
      .then((response) => {
        return response.data;
      });
  }
};

const sizesLimit = pLimit(10);

export const useSizes = (
  data: DownloadCartItem[] | undefined
): UseQueryResult<number, AxiosError>[] => {
  const settings = React.useContext(DownloadSettingsContext);
  const { facilityName, apiUrl, downloadApiUrl } = settings;

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['size', number]
  >[] = React.useMemo(() => {
    return data
      ? data.map((cartItem) => {
          const { entityId, entityType } = cartItem;
          return {
            queryKey: ['size', entityId],
            queryFn: () =>
              sizesLimit(() =>
                getSize(entityId, entityType, {
                  facilityName,
                  apiUrl,
                  downloadApiUrl,
                })
              ),
            onError: (error) => {
              handleICATError(error, false);
            },
            staleTime: Infinity,
          };
        })
      : [];
  }, [data, facilityName, apiUrl, downloadApiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  const [sizes, setSizes] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);

  // when data changes (i.e. due to sorting or filtering) set the countAppliedRef
  // back to 0 so we can restart the process, as well as clear sizes
  React.useEffect(() => {
    countAppliedRef.current = 0;
    setSizes([]);
  }, [data]);

  // need to use useDeepCompareEffect here because the array returned by useQueries
  // is different every time this hook runs
  useDeepCompareEffect(() => {
    const currCountReturned = queries.reduce(
      (acc, curr) => acc + (curr.isFetched ? 1 : 0),
      0
    );
    const batchMax =
      sizes.length - currCountReturned < 10
        ? sizes.length - currCountReturned
        : 10;
    // this in effect batches our updates to only happen in batches >= 10
    if (currCountReturned - countAppliedRef.current >= batchMax) {
      setSizes(queries);
      countAppliedRef.current = currCountReturned;
    }
  }, [sizes, queries]);

  return sizes;
};

export const getDatafileCount: (
  entityId: number,
  entityType: string,
  settings: { apiUrl: string }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: { apiUrl: string }
) => {
  if (entityType === 'datafile') {
    // need to do this in a setTimeout to ensure it doesn't block the main thread
    return new Promise((resolve) =>
      window.setTimeout(() => {
        resolve(1);
      }, 0)
    );
  } else if (entityType === 'dataset') {
    return axios
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
        params: {
          where: {
            'dataset.id': {
              eq: entityId,
            },
          },
          include: '"dataset"',
        },
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        return response.data;
      });
  } else {
    return axios
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
        params: {
          include: '{"dataset": "investigation"}',
          where: {
            'dataset.investigation.id': {
              eq: entityId,
            },
          },
        },
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        return response.data;
      });
  }
};

const datafileCountslimit = pLimit(10);

export const useDatafileCounts = (
  data: DownloadCartItem[] | undefined
): UseQueryResult<number, AxiosError>[] => {
  const settings = React.useContext(DownloadSettingsContext);
  const { apiUrl } = settings;

  const queryConfigs: UseQueryOptions<
    number,
    AxiosError,
    number,
    ['datafileCount', number]
  >[] = React.useMemo(() => {
    return data
      ? data.map((cartItem) => {
          const { entityId, entityType } = cartItem;
          return {
            queryKey: ['datafileCount', entityId],
            queryFn: () =>
              datafileCountslimit(() =>
                getDatafileCount(entityId, entityType, {
                  apiUrl,
                })
              ),
            onError: (error) => {
              handleICATError(error, false);
            },
            staleTime: Infinity,
          };
        })
      : [];
  }, [data, apiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  const queries: UseQueryResult<number, AxiosError>[] = useQueries(queryConfigs);

  const [datafileCounts, setDatafileCounts] = React.useState<
    UseQueryResult<number, AxiosError>[]
  >([]);

  const countAppliedRef = React.useRef(0);

  // when data changes (i.e. due to sorting or filtering) set the countAppliedRef
  // back to 0 so we can restart the process, as well as clear datafileCounts
  React.useEffect(() => {
    countAppliedRef.current = 0;
    setDatafileCounts([]);
  }, [data]);

  // need to use useDeepCompareEffect here because the array returned by useQueries
  // is different every time this hook runs
  useDeepCompareEffect(() => {
    const currCountReturned = queries.reduce(
      (acc, curr) => acc + (curr.isFetched ? 1 : 0),
      0
    );
    const batchMax =
      datafileCounts.length - currCountReturned < 10
        ? datafileCounts.length - currCountReturned
        : 10;
    // this in effect batches our updates to only happen in batches >= 10
    if (currCountReturned - countAppliedRef.current >= batchMax) {
      setDatafileCounts(queries);
      countAppliedRef.current = currCountReturned;
    }
  }, [datafileCounts, queries]);

  return datafileCounts;
};

export const getDataUrl = (
  preparedId: string,
  fileName: string,
  idsUrl: string
): string => {
  // Construct a link to download the prepared cart.
  return `${idsUrl}/getData?sessionId=${
    readSciGatewayToken().sessionId
  }&preparedId=${preparedId}&outname=${fileName}`;
};
