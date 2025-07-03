import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import {
  Datafile,
  Dataset,
  Investigation,
  MicroFrontendId,
} from '../app.types';
import handleICATError from '../handleICATError';
import { NotificationType } from '../state/actions/actions.types';
import { StateType } from '../state/app.types';
import { fetchDatafiles } from './datafiles';
import { fetchDatasets } from './datasets';
import { fetchInvestigations } from './investigations';
import { useRetryICATErrors } from './retryICATErrors';

// use overloads to get the correct type if entityName is not variable
export function useEntity(
  entityName: 'investigation',
  entityField: string,
  fieldValue: string,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  options?: UseQueryOptions<
    Investigation | Dataset | Datafile,
    AxiosError | Error
  >
): UseQueryResult<Investigation, AxiosError>;
export function useEntity(
  entityName: 'dataset',
  entityField: string,
  fieldValue: string,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  options?: UseQueryOptions<
    Investigation | Dataset | Datafile,
    AxiosError | Error
  >
): UseQueryResult<Dataset, AxiosError>;
export function useEntity(
  entityName: 'datafile',
  entityField: string,
  fieldValue: string,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  options?: UseQueryOptions<
    Investigation | Dataset | Datafile,
    AxiosError | Error
  >
): UseQueryResult<Datafile, AxiosError>;
export function useEntity(
  entityName: 'investigation' | 'dataset' | 'datafile',
  entityField: string,
  fieldValue: string,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  options?: UseQueryOptions<
    Investigation | Dataset | Datafile,
    AxiosError | Error
  >
): UseQueryResult<Investigation | Dataset | Datafile, AxiosError | Error>;
export function useEntity(
  entityName: 'investigation' | 'dataset' | 'datafile',
  entityField: string,
  fieldValue: string,
  includeFilter?: {
    filterType: 'include';
    filterValue: string;
  },
  options?: UseQueryOptions<
    Investigation | Dataset | Datafile,
    AxiosError | Error
  >
): UseQueryResult<Investigation | Dataset | Datafile, AxiosError | Error> {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<Investigation | Dataset | Datafile, AxiosError | Error>(
    [entityName, entityField, fieldValue, includeFilter],
    async (_) => {
      switch (entityName) {
        case 'investigation':
          const investigations = await fetchInvestigations(
            apiUrl,
            { sort: {}, filters: {} },
            [
              {
                filterType: 'where',
                filterValue: `{"${entityField}":{"eq":"${fieldValue}"}}`,
              },
              ...(includeFilter ? [includeFilter] : []),
            ]
          );
          if (investigations?.length === 1) return investigations[0];
          else
            throw Error(
              `Unable to identify single ${entityName} with ${entityField} matching ${fieldValue}`
            );
        case 'dataset':
          const datasets = await fetchDatasets(
            apiUrl,
            { sort: {}, filters: {} },
            [
              {
                filterType: 'where',
                filterValue: `{"${entityField}":{"eq":"${fieldValue}"}}`,
              },
              // allow overriding default include filter
              ...(includeFilter ? [includeFilter] : []),
            ]
          );
          if (datasets?.length === 1) return datasets[0];
          else
            throw Error(
              `Unable to identify single ${entityName} with ${entityField} matching ${fieldValue}`
            );
        case 'datafile':
          const datafiles = await fetchDatafiles(
            apiUrl,
            { sort: {}, filters: {} },
            [
              {
                filterType: 'where',
                filterValue: `{"${entityField}":{"eq":"${fieldValue}"}}`,
              },
              ...(includeFilter ? [includeFilter] : []),
            ]
          );
          if (datafiles?.length === 1) return datafiles[0];
          else
            throw Error(
              `Unable to identify single ${entityName} with ${entityField} matching ${fieldValue}`
            );
        default:
          throw Error(
            'Entity type not one of investigation, dataset or datafile'
          );
      }
    },
    {
      onError: (error) => {
        // only handle an ICAT error for axios errors aka not the "not found" errors we list above
        if (axios.isAxiosError(error)) handleICATError(error);
        else {
          document.dispatchEvent(
            new CustomEvent(MicroFrontendId, {
              detail: {
                type: NotificationType,
                payload: {
                  severity: 'error',
                  message: error.message,
                },
              },
            })
          );
        }
      },
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error))
          return retryICATErrors(failureCount, error);
        else return false;
      },
      ...options,
    }
  );
}
