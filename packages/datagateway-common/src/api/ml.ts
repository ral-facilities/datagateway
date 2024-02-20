import { Investigation, QueryParams } from '../app.types';
import { useQuery, UseQueryResult } from 'react-query';
import axios, { AxiosError } from 'axios';
import { parseQueryToSearch, parseSearchToQuery } from './index';
import { useHistory } from 'react-router-dom';

const ML_API_BASE_URL = 'http://172.16.103.71:4001/api/v2';

export type MLSearchResults = ({
  score: number;
} & Investigation)[];

export const ML_SEARCH_TYPE = {
  semantic: 'semantic',
  lexical: 'lexical',
} as const;

export type MLSearchType = typeof ML_SEARCH_TYPE[keyof typeof ML_SEARCH_TYPE];

export function isMLSearchType(type: unknown): type is MLSearchType {
  return typeof type === 'string' && type in ML_SEARCH_TYPE;
}

export function usePushMLSearchType(): (type: MLSearchType) => void {
  const { push } = useHistory();

  return (type) => {
    const query: QueryParams = {
      ...parseSearchToQuery(window.location.search),
      searchType: type,
    };
    push(`?${parseQueryToSearch(query).toString()}`);
  };
}

export function useClearMLSearchType(): () => void {
  const { push } = useHistory();

  return () => {
    const query: QueryParams = {
      ...parseSearchToQuery(window.location.search),
      searchType: null,
    };
    push(`?${parseQueryToSearch(query).toString()}`);
  };
}

export function useMLSearch({
  query,
  type,
}: {
  query: string;
  type: MLSearchType;
}): UseQueryResult<MLSearchResults, AxiosError> {
  return useQuery<MLSearchResults, AxiosError>(
    ['mlSearch', type, query],
    () =>
      axios
        .post(
          '/search',
          {
            query,
            n_top_results: 50,
            is_semantic: type === 'semantic',
          },
          {
            baseURL: ML_API_BASE_URL,
          }
        )
        .then((response) => response.data),
    {
      select: (data) =>
        data.sort((resultA, resultB) => resultB.score - resultA.score),
    }
  );
}
