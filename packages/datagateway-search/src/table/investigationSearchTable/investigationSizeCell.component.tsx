import React from 'react';
import {
  formatCountOrSize,
  Investigation,
  useInvestigationSize,
} from 'datagateway-common';

/**
 * A cell in {@link InvestigationSearchTable} that displays the size of a dataset.
 * @param investigation
 * @constructor
 */
function InvestigationSizeCell({
  investigation,
}: {
  investigation: Investigation;
}): JSX.Element {
  const result = useInvestigationSize(investigation.id);
  return <>{formatCountOrSize(result)}</>;
}

export default InvestigationSizeCell;
