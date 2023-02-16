import {
  useInstrumentsPaginated,
  useInvestigation,
  useFacilityCyclesByInvestigation,
  Preloader,
  MicroFrontendId,
  NotificationType,
} from 'datagateway-common';
import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { paths } from './pageContainer.component';
import * as log from 'loglevel';

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

  const {
    data: investigations,
    isLoading: investigationLoading,
  } = useInvestigation(investigationId);
  const investigation = investigations?.[0];

  const {
    data: instruments,
    isLoading: instrumentLoading,
  } = useInstrumentsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationInstruments.investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const instrument = instruments?.[0];

  const {
    data: facilityCycles,
    isLoading: facilityCycleLoading,
    isIdle: facilityCycleIdle,
  } = useFacilityCyclesByInvestigation(
    investigation?.startDate?.replace('+', ' ')
  );
  const facilityCycle = facilityCycles?.[0];

  const loading =
    facilityCycleLoading ||
    instrumentLoading ||
    investigationLoading ||
    (!!investigation && facilityCycleIdle);

  if (investigation && instrument && facilityCycle) {
    return (
      <Redirect
        to={`/browse/instrument/${instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigation.id}/dataset`}
      />
    );
  } else {
    if (!loading && (!investigation || !instrument || !facilityCycle)) {
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
      <Preloader loading={loading}>
        <Redirect to={paths.homepage} />
      </Preloader>
    );
  }
};

export default DoiRedirect;
