import {
  buildDatasetTableUrlForInvestigation,
  FACILITY_NAME,
  MicroFrontendId,
  NotificationType,
  Preloader,
  useInvestigation,
} from 'datagateway-common';
import log from 'loglevel';
import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { paths } from './pageContainer.component';

type DoiRedirectRouteParams = {
  facilityName: string;
  entityName: string;
  entityId: string;
};

const DoiRedirect: React.FC = () => {
  const { entityName, entityId } = useParams<DoiRedirectRouteParams>();

  // currently only support entityName === "investigation"
  // will need to refactor this code if additional entityNames needed

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

  if (investigation && redirectUrl) {
    return <Redirect to={redirectUrl} />;
  }

  if (!isInvestigationLoading) {
    log.error('Invalid DOI redirect');
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message: `Cannot read the ${entityName}. You may not have read access, or it may not be published yet.`,
          },
        },
      })
    );
  }

  return (
    <Preloader loading={isInvestigationLoading}>
      <Redirect to={paths.homepage} />
    </Preloader>
  );
};

export default DoiRedirect;
