import {
  type Dataset,
  formatCountOrSize,
  type Investigation,
  useDatasetsDatafileCount,
  useDatasetSizes,
  useInvestigationDatasetCount,
  useInvestigationSize,
} from 'datagateway-common';
import React from 'react';

/**
 * A cell in {@link InvestigationSearchTable} that displays the count of a dataset.
 * @param investigation
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

/**
 * A cell in {@link InvestigationSearchTable} that displays the size of an {@link Investigation}.
 * @param investigation
 */
function InvestigationSizeCell({
  investigation,
}: {
  investigation: Investigation;
}): JSX.Element {
  const result = useInvestigationSize(investigation.id, { enabled: true });
  return <>{formatCountOrSize(result, true)}</>;
}

/**
 * A cell in {@link DatasetSearchTable} that displays the datafile count of the given {@link Dataset}.
 * @param dataset
 */
function DatasetDatafileCountCell({
  dataset,
}: {
  dataset: Dataset;
}): JSX.Element {
  const result = useDatasetsDatafileCount(dataset);
  return <>{formatCountOrSize(result[0])}</>;
}

/**
 * A cell in {@link DatasetSearchTable} that displays the size of the given {@link Dataset}.
 * @param dataset
 */
function DatasetSizeCell({ dataset }: { dataset: Dataset }): JSX.Element {
  const result = useDatasetSizes(dataset);
  return <>{formatCountOrSize(result[0])}</>;
}

export {
  InvestigationDatasetCountCell,
  InvestigationSizeCell,
  DatasetDatafileCountCell,
  DatasetSizeCell,
};
