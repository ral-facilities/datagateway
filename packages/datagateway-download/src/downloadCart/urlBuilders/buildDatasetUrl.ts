import { Dataset, FacilityCycle, fetchDatasets } from 'datagateway-common';
import { buildInvestigationUrl } from '../urlBuilders';

async function fetchDataset({
  apiUrl,
  facilityName,
  datasetId,
}: {
  apiUrl: string;
  facilityName: string;
  datasetId: Dataset['id'];
}): Promise<Dataset | null> {
  let includeField: string;
  switch (facilityName) {
    case 'isis':
      includeField = 'investigation.investigationInstruments.instrument';
      break;
    default:
      includeField = 'investigation';
      break;
  }

  const datasets = await fetchDatasets(apiUrl, { sort: {}, filters: {} }, [
    {
      filterType: 'where',
      filterValue: JSON.stringify({ id: { eq: datasetId } }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify(includeField),
    },
  ]);

  return datasets[0] ?? null;
}

/**
 * Given either a dataset ID or a {@link Dataset} object, constructs a URL to the {@link Dataset}.
 *
 * If providing a {@link Dataset} object, the {@link Dataset.investigation} has to be present,
 * and the {@link Investigation} object has to have the {@link Investigation.investigationInstruments} field.
 *
 * @returns The URL to the dataset table, or `null` if the URL cannot be constructed due to missing info.
 */
async function buildDatasetUrl({
  apiUrl,
  facilityName,
  datasetId,
  dataset: providedDataset,
  facilityCycles,
}: {
  datasetId?: Dataset['id'];
  dataset?: Dataset;
  apiUrl: string;
  facilityName: string;
  facilityCycles: FacilityCycle[];
}): Promise<string | null> {
  if (!datasetId && !providedDataset) {
    // if neither a dataset object nor a dataset ID is provided, nothing can be built
    // return nothing.
    return null;
  }

  let dataset: Dataset | null;
  if (providedDataset) {
    dataset = providedDataset;
  } else if (datasetId) {
    dataset = await fetchDataset({ apiUrl, facilityName, datasetId });
  } else {
    return null;
  }

  const investigation = dataset?.investigation;
  if (!dataset || !investigation) return null;

  const prefixUrl = await buildInvestigationUrl({
    apiUrl,
    facilityName,
    investigation,
    facilityCycles,
  });
  if (!prefixUrl) return null;

  return `${prefixUrl}/${dataset.id}/datafile`;
}

export default buildDatasetUrl;
