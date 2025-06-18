import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import {
  buildDatafileTableUrlForDataset,
  buildDatasetTableUrlForInvestigation,
  Datafile,
  Dataset,
  FACILITY_NAME,
  fetchDatafiles,
  fetchDatasets,
  fetchInvestigations,
  handleICATError,
  Investigation,
  MicroFrontendId,
  NotificationType,
  Preloader,
  StateType,
  useInvestigation,
  useRetryICATErrors,
} from 'datagateway-common';
import log from 'loglevel';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { paths } from './pageContainer.component';

export const RedirectComponent: React.FC<{
  redirectUrl: string;
  loading: boolean;
  errorMessage?: string;
}> = (props) => {
  const { redirectUrl, loading, errorMessage: error } = props;

  if (error) {
    log.error('Invalid redirect');
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message: error,
          },
        },
      })
    );
  }

  return (
    <Preloader loading={loading}>
      <Redirect to={redirectUrl} />
    </Preloader>
  );
};

type DoiRedirectRouteParams = {
  facilityName: string;
  entityName: string;
  entityId: string;
};

export const DoiRedirect: React.FC = () => {
  const { entityName, entityId } = useParams<DoiRedirectRouteParams>();

  const investigationId = parseInt(entityId);

  const { data: investigations, isLoading: isInvestigationLoading } =
    useInvestigation(investigationId, [
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigationInstruments: 'instrument',
          investigationFacilityCycles: 'facilityCycle',
        }),
      },
    ]);

  const investigation = investigations?.[0];
  const redirectUrl = investigation
    ? buildDatasetTableUrlForInvestigation({
        investigation,
        facilityName: FACILITY_NAME.isis,
      })
    : null;

  return (
    <RedirectComponent
      redirectUrl={redirectUrl ?? paths.homepage}
      loading={isInvestigationLoading}
      errorMessage={
        !isInvestigationLoading && !investigation
          ? `Cannot read the ${entityName}. You may not have read access, or it may not be published yet.`
          : undefined
      }
    />
  );
};

type GenericRedirectRouteParams = {
  facilityName: string;
  entityName: 'investigation' | 'dataset' | 'datafile';
  entityField: string;
  fieldValue: string;
};

export const useEntity = (
  facilityName: string,
  entityName: 'investigation' | 'dataset' | 'datafile',
  entityField: string,
  fieldValue: string
): UseQueryResult<Investigation | Dataset | Datafile, AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const retryICATErrors = useRetryICATErrors();

  return useQuery<
    Investigation | Dataset | Datafile,
    AxiosError,
    Investigation | Dataset | Datafile,
    [string, string, string, string]
  >(
    [facilityName, entityName, entityField, fieldValue],
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
              ...(facilityName === FACILITY_NAME.isis
                ? [
                    {
                      filterType: 'include',
                      filterValue: JSON.stringify({
                        investigationInstruments: 'instrument',
                        investigationFacilityCycles: 'facilityCycle',
                      }),
                    },
                  ]
                : []),
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
              {
                filterType: 'include',
                filterValue: JSON.stringify([
                  'investigation',
                  ...(facilityName === FACILITY_NAME.isis
                    ? [
                        'investigation.investigationInstruments.instrument',
                        'investigation.investigationFacilityCycles.facilityCycle',
                      ]
                    : []),
                ]),
              },
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
              {
                filterType: 'include',
                filterValue: JSON.stringify([
                  'dataset.investigation',
                  'dataset',
                  ...(facilityName === FACILITY_NAME.isis
                    ? [
                        'dataset.investigation.investigationInstruments.instrument',
                        'dataset.investigation.investigationFacilityCycles.facilityCycle',
                      ]
                    : []),
                ]),
              },
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
        console.log('error', error);
        // only handle an ICAT error for axios errors aka not the "not found" errors we list above
        if (isAxiosError(error)) handleICATError(error);
      },
      retry: retryICATErrors,
    }
  );
};

export const GenericRedirect: React.FC = () => {
  const { facilityName, entityName, entityField, fieldValue } =
    useParams<GenericRedirectRouteParams>();

  const { data: entity, isLoading: isEntityLoading } = useEntity(
    facilityName,
    entityName,
    entityField,
    decodeURIComponent(fieldValue) // call decodeURIComponent here to e.g. allow URL encoding of slashes to search for datafile locations etc.
  );

  const redirectUrl =
    entity &&
    (entityName === 'investigation'
      ? buildDatasetTableUrlForInvestigation({
          investigation: entity as Investigation,
          facilityName,
        })
      : entityName === 'dataset'
      ? buildDatafileTableUrlForDataset({
          dataset: entity as Dataset,
          facilityName,
        })
      : entityName === 'datafile'
      ? // TODO: better link for a datafile redirect?
        buildDatafileTableUrlForDataset({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          dataset: (entity as Datafile).dataset!,
          facilityName,
        })
      : null);

  return (
    <RedirectComponent
      redirectUrl={redirectUrl ?? paths.homepage}
      loading={isEntityLoading}
      errorMessage={
        !isEntityLoading && !entity
          ? `Cannot redirect to the ${entityName} matching the given ${entityField}: ${fieldValue}. You may not have read access, or the given ${entityName} ${entityField} may not be valid or unique.`
          : undefined
      }
    />
  );
};
