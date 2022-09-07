import {
  AdditionalFilters,
  Datafile,
  Dataset,
  FacilityCycle,
  fetchDatafiles,
  fetchDatasets,
  fetchInvestigations,
  findInvestigationFacilityCycle,
  Investigation,
} from 'datagateway-common';

async function fetchInvestigation({
  apiUrl,
  facilityName,
  investigationId,
}: {
  apiUrl: string;
  facilityName: string;
  investigationId: number;
}): Promise<Investigation | null> {
  const filters: AdditionalFilters = [
    {
      filterType: 'where',
      filterValue: JSON.stringify({ id: { eq: investigationId } }),
    },
  ];

  if (facilityName === 'isis') {
    filters.push({
      filterType: 'include',
      filterValue: JSON.stringify(['investigationInstruments.instrument']),
    });
  }

  const investigations = await fetchInvestigations(
    apiUrl,
    { sort: {}, filters: {} },
    filters
  );

  return investigations[0] ?? null;
}

/**
 * Given either an investigation ID or an {@link Investigation} object, constructs a link to the {@link Investigation}.
 *
 * If providing an {@link Investigation} object, the {@link Investigation.investigationInstruments} field has to be present.
 *
 * @returns A URL to the investigation table, or `null` if the URL cannot be constructed due to missing info.
 */
async function buildInvestigationUrl({
  apiUrl,
  facilityName,
  investigation: providedInvestigation,
  investigationId,
  facilityCycles,
}: {
  investigation?: Investigation;
  investigationId?: Investigation['id'];
  apiUrl: string;
  facilityName: string;
  facilityCycles: FacilityCycle[];
}): Promise<string | null> {
  if (!investigationId && !providedInvestigation) {
    // if neither an investigation object or an investigation ID is provided, nothing can be built
    // return nothing.
    return null;
  }

  if (facilityName !== 'ISIS' && facilityName !== 'DLS') {
    if (investigationId) {
      return `/browse/investigation/${investigationId}/dataset`;
    }
    if (providedInvestigation) {
      return `/browse/investigation/${providedInvestigation.id}/dataset`;
    }
    return null;
  }

  let investigation: Investigation | null;
  if (providedInvestigation) {
    investigation = providedInvestigation;
  } else if (investigationId) {
    investigation = await fetchInvestigation({
      apiUrl,
      facilityName,
      investigationId,
    });
  } else {
    return null;
  }

  if (!investigation) return null;

  switch (facilityName) {
    case 'ISIS':
      const instrument =
        investigation?.investigationInstruments?.[0]?.instrument;
      if (!instrument) return null;

      const facilityCycle = findInvestigationFacilityCycle(
        investigation,
        facilityCycles
      );
      if (!facilityCycle) return null;

      return `/browse/instrument/${instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigation.id}/dataset`;

    case 'DLS':
      return `/browse/proposal/${investigation.name}/investigation/${investigation.id}/dataset`;
  }
}

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

async function fetchDatafile({
  apiUrl,
  facilityName,
  datafileId,
}: {
  apiUrl: string;
  facilityName: string;
  datafileId: Datafile['id'];
}): Promise<Datafile | null> {
  let includeField: string;
  switch (facilityName) {
    case 'isis':
      includeField =
        'dataset.investigation.investigationInstruments.instrument';
      break;
    default:
      includeField = 'dataset.investigation';
      break;
  }

  const datafiles = await fetchDatafiles(apiUrl, { sort: {}, filters: {} }, [
    {
      filterType: 'where',
      filterValue: JSON.stringify({ id: { eq: datafileId } }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify(includeField),
    },
  ]);

  return datafiles[0] ?? null;
}

/**
 * Given either a dataset ID or a {@link Datafile} object, constructs a URL to the {@link Datafile}.
 * The URL points to the dataset table the {@link Datafile} belongs to.
 *
 * @returns The URL to the dataset table that the datafile belongs to,
 *          or `null` if the URL cannot be constructed due to missing info.
 */
async function buildDatafileUrl({
  apiUrl,
  facilityName,
  datafileId,
  facilityCycles,
}: {
  datafileId: Datafile['id'];
  apiUrl: string;
  facilityName: string;
  facilityCycles: FacilityCycle[];
}): Promise<string | null> {
  const datafile = await fetchDatafile({ apiUrl, facilityName, datafileId });
  const dataset = datafile?.dataset;
  if (!dataset) return null;

  return buildDatasetUrl({
    apiUrl,
    facilityName,
    facilityCycles,
    dataset,
  });
}

export { buildInvestigationUrl, buildDatasetUrl, buildDatafileUrl };
