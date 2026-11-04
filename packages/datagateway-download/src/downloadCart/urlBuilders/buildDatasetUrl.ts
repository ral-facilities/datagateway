import { Dataset } from 'datagateway-common';

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
  else {
    dataset = null;
  }
  if (datasetId) {
    return `/redirect/${facilityName}/dataset/id/${datasetId}`;
  }
  if (dataset) {
    return `/redirect/${facilityName}/dataset/id/${dataset.id}`;
  }
  return null
}

export default buildDatasetUrl;
