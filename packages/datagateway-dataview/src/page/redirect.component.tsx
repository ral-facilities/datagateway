import {
  Datafile,
  Dataset,
  FACILITY_NAME,
  Investigation,
  MicroFrontendId,
  NotificationType,
  Preloader,
  StateType,
  buildDatafileTableUrlForDataset,
  buildDatasetTableUrlForInvestigation,
  readSciGatewayToken,
  useEntity,
} from 'datagateway-common';
import log from 'loglevel';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useLocation, useParams } from 'react-router-dom';
import { paths } from './pageContainer.component';

export const RedirectComponent: React.FC<{
  redirectUrl: string | null;
  loading: boolean;
  errorMessage?: string;
}> = (props) => {
  const { redirectUrl, loading, errorMessage: error } = props;

  const { pathname } = useLocation();
  const anonUserName = useSelector(
    (state: StateType) => state.dgcommon.anonUserName
  );
  const username = readSciGatewayToken().username;
  const loggedInAnonymously =
    username === null || username === (anonUserName ?? 'anon/anon');

  if (loggedInAnonymously === true && typeof error !== 'undefined') {
    sessionStorage.setItem('referrer', pathname);
    return <Redirect to={'/login'} />;
  }

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
      <Redirect to={redirectUrl ?? paths.homepage} />
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
    },
    {},
    true
  );

  const redirectUrl = investigation
    ? buildDatasetTableUrlForInvestigation({
        investigation,
        facilityName: FACILITY_NAME.isis,
      })
    : null;

  return (
    <RedirectComponent
      redirectUrl={redirectUrl}
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
          : undefined,
    {},
    true
  );

  const redirectUrl =
    (entity &&
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
            : null)) ??
    null;

  return (
    <RedirectComponent
      redirectUrl={redirectUrl}
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
