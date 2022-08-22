import React from 'react';
import type { Investigation } from 'datagateway-common';
import {
  formatCountOrSize,
  useInvestigationDatasetCount,
} from 'datagateway-common';

/**
 * A cell in {@link InvestigationSearchTable} that displays the count of a dataset.
 * @param investigation
 * @constructor
 */
function InvestigationDatasetCountCell({
  investigation,
}: {
  investigation: Investigation;
}): JSX.Element {
  const result = useInvestigationDatasetCount({
    investigationId: investigation.id,
  });
  return <>{formatCountOrSize(result)}</>;
}

export default InvestigationDatasetCountCell;
