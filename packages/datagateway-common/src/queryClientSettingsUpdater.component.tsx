import { QueryCache, QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { useSelector } from 'react-redux';
import { handleDOIAPIError } from './api/dois';
import { LuceneError, handleLuceneError } from './api/lucene';
import handleICATError from './handleICATError';
import { StateType } from './state/app.types';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      icatError?: boolean;
      luceneError?: boolean;
      DOIAPIError?: boolean;
      broadcastCondition?: (error: AxiosError) => boolean;
      logCondition?: (error: AxiosError) => boolean;
      useEntityErrorHandler?: (error: Error) => void;
    };
  }
}

export const queryCacheConfig: ConstructorParameters<typeof QueryCache>[0] = {
  onError: (error, query) => {
    if (query.meta?.icatError === true) {
      const axiosError = error as AxiosError;
      handleICATError(axiosError, query.meta?.broadcastCondition?.(axiosError));
    }
    if (query.meta?.luceneError === true) {
      handleLuceneError(error as AxiosError<LuceneError>);
    }
    if (query.meta?.DOIAPIError === true) {
      const axiosError = error as AxiosError<{
        detail: { msg: string }[] | string;
      }>;
      handleDOIAPIError(
        axiosError,
        query.meta.logCondition?.(axiosError),
        query.meta.broadcastCondition?.(axiosError)
      );
    }
    if (query.meta?.useEntityErrorHandler)
      query.meta.useEntityErrorHandler(error);
  },
};

export const QueryClientSettingsUpdater: React.FC<{
  queryRetries: number | undefined;
  queryClient: QueryClient;
}> = (props) => {
  const { queryClient, queryRetries } = props;

  React.useEffect(() => {
    if (typeof queryRetries !== 'undefined') {
      const opts = queryClient.getDefaultOptions();
      queryClient.setDefaultOptions({
        ...opts,
        queries: { ...opts.queries, retry: queryRetries },
      });
    }
  }, [queryClient, queryRetries]);

  return null;
};

export const QueryClientSettingsUpdaterRedux: React.FC<{
  queryClient: QueryClient;
}> = (props) => {
  const { queryClient } = props;
  const queryRetries = useSelector(
    (state: StateType) => state.dgcommon.queryRetries
  );

  return (
    <QueryClientSettingsUpdater
      queryClient={queryClient}
      queryRetries={queryRetries}
    />
  );
};
