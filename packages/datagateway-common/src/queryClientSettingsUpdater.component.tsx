import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { StateType } from './state/app.types';
import { useSelector } from 'react-redux';

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
