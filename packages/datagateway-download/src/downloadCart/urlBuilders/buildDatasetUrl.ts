import { Dataset } from 'datagateway-common';
import { buildInvestigationUrl } from '../urlBuilders';

async function buildDatasetUrl({
  facilityName,
  datasetId,
  dataset: providedDataset,
}: {
  datasetId?: Dataset['id'];
  dataset?: Dataset;
  facilityName: string;
}): Promise<string | null> {
  if (!datasetId && !providedDataset) {
    // if neither a dataset object nor a dataset ID is provided, nothing can be built
    // return nothing.
    return null;
  }

  let dataset: Dataset | null;
  if (providedDataset) {
    dataset = providedDataset;
  }

  const investigation = dataset?.investigation;
  if (!dataset || !investigation) return null;

  const prefixUrl = await buildInvestigationUrl({
    facilityName,
    investigation,
  });
  if (!prefixUrl) return null;
  return prefixUrl;
}

export default buildDatasetUrl;
