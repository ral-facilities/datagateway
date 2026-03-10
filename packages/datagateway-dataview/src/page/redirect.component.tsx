import {
  Datafile,
  Dataset,
  FACILITY_NAME,
  Investigation,
  MicroFrontendId,
  NotificationType,
  Preloader,
  buildDatafileTableUrlForDataset,
  buildDatasetTableUrlForInvestigation,
  useEntity,
} from 'datagateway-common';
import log from 'loglevel';
import React from 'react';
import { Redirect, useLocation, useParams } from 'react-router-dom';
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

  const { data: investigation, isLoading: isInvestigationLoading } = useEntity(
    'investigation',
    'id',
    entityId,
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
        investigationFacilityCycles: 'facilityCycle',
      }),
    }
  );

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

export const GenericRedirect: React.FC = () => {
  const { facilityName, entityName, entityField, fieldValue } =
    useParams<GenericRedirectRouteParams>();

  const { state } = useLocation<{ fromDataPublication?: boolean }>();

  const isISIS =
    facilityName.toLowerCase() === FACILITY_NAME.isis.toLowerCase();

  const { data: entity, isLoading: isEntityLoading } = useEntity(
    entityName,
    entityField,
    decodeURIComponent(fieldValue), // call decodeURIComponent here to e.g. allow URL encoding of slashes to search for datafile locations etc.
    entityName === 'investigation'
      ? isISIS
        ? {
            filterType: 'include',
            filterValue: JSON.stringify({
              investigationInstruments: 'instrument',
              investigationFacilityCycles: 'facilityCycle',
            }),
          }
        : undefined
      : entityName === 'dataset'
        ? {
            filterType: 'include',
            filterValue: JSON.stringify([
              'investigation',
              ...(isISIS
                ? [
                    'investigation.investigationInstruments.instrument',
                    'investigation.investigationFacilityCycles.facilityCycle',
                  ]
                : []),
            ]),
          }
        : entityName === 'datafile'
          ? {
              filterType: 'include',
              filterValue: JSON.stringify([
                'dataset.investigation',
                'dataset',
                ...(isISIS
                  ? [
                      'dataset.investigation.investigationInstruments.instrument',
                      'dataset.investigation.investigationFacilityCycles.facilityCycle',
                    ]
                  : []),
              ]),
            }
          : undefined
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
          ? buildDatafileTableUrlForDataset({
              dataset: (entity as Datafile).dataset!,
              facilityName,
              queryParams: new URLSearchParams({
                filters: JSON.stringify({
                  name: { value: entity.name, type: 'exact' },
                }),
              }),
            })
          : null);

  return (
    <RedirectComponent
      redirectUrl={redirectUrl ?? paths.homepage}
      loading={isEntityLoading}
      errorMessage={
        !isEntityLoading && !entity
          ? state?.fromDataPublication
            ? `Cannot redirect to the ${entityName} matching the given ${entityField}: ${fieldValue}. It may not be published and you don't have permission to see it yet, or you may not have read access for other reasons`
            : `Cannot redirect to the ${entityName} matching the given ${entityField}: ${fieldValue}. You may not have read access, or the given ${entityName} ${entityField} may not be valid or unique.`
          : undefined
      }
    />
  );
};
