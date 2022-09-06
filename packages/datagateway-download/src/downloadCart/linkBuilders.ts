import {
  AdditionalFilters,
  Dataset,
  FacilityCycle,
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
 * @returns
 */
async function buildInvestigationLink({
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
    return `/browse/investigation/${investigationId}/dataset`;
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

async function buildDatasetUrl({
  apiUrl,
  facilityName,
  datasetId,
  facilityCycles,
}: {
  investigation: Investigation;
  datasetId: Dataset['id'];
  apiUrl: string;
  facilityName: string;
  facilityCycles: FacilityCycle[];
}): Promise<string | null> {
  const dataset = await fetchDataset({ apiUrl, facilityName, datasetId });
  const investigation = dataset?.investigation;
  if (!investigation) return null;

  const prefixUrl = await buildInvestigationLink({
    apiUrl,
    facilityName,
    investigation,
    facilityCycles,
  });
  if (!prefixUrl) return null;

  return `${prefixUrl}/${datasetId}/datafile`;
}

export { buildInvestigationLink };
