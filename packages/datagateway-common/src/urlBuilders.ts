import {
  Datafile,
  type Dataset,
  FACILITY_NAME,
  type Investigation,
} from './app.types';

function isLandingPageSupportedForHierarchy(hierarchy: string): boolean {
  return hierarchy === FACILITY_NAME.isis;
}

function buildInvestigationLandingUrl(
  investigation: Investigation
): string | null {
  const instrument = investigation?.investigationInstruments?.[0]?.instrument;
  const facilityCycle =
    investigation?.investigationFacilityCycles?.[0]?.facilityCycle;
  if (!instrument || !facilityCycle) return null;

  return `/browse/instrument/${instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigation.id}`;
}

function buildDatasetTableUrlForInvestigation({
  facilityName,
  investigation,
}: {
  investigation: Investigation;
  facilityName: string;
}): string | null {
  const isISIS = facilityName === FACILITY_NAME.isis;
  const isDLS = facilityName === FACILITY_NAME.dls;

  if (!isISIS && !isDLS) {
    // is a generic facility, return a generic link to the investigation
    return `/browse/investigation/${investigation.id}/dataset`;
  }

  if (isISIS) {
    const instrument = investigation?.investigationInstruments?.[0]?.instrument;
    const facilityCycle =
      investigation?.investigationFacilityCycles?.[0]?.facilityCycle;
    if (!instrument || !facilityCycle) return null;

    return `/browse/instrument/${instrument.id}/facilityCycle/${facilityCycle.id}/investigation/${investigation.id}/dataset`;
  }

  if (isDLS) {
    return `/browse/proposal/${investigation.name}/investigation/${investigation.id}/dataset`;
  }

  return null;
}

function buildDatasetLandingUrl(dataset: Dataset): string | null {
  const investigation = dataset.investigation;
  if (!investigation) return null;

  const datasetTableUrl = buildDatasetTableUrlForInvestigation({
    investigation,
    facilityName: FACILITY_NAME.isis,
  });
  if (!datasetTableUrl) return null;

  return `${datasetTableUrl}/${dataset.id}`;
}

function buildDatafileTableUrlForDataset({
  dataset,
  facilityName,
}: {
  dataset: Dataset;
  facilityName: string;
}): string | null {
  const investigation = dataset.investigation;
  if (!investigation) return null;

  const datasetTableUrl = buildDatasetTableUrlForInvestigation({
    investigation,
    facilityName,
  });
  if (!datasetTableUrl) return null;

  return `${datasetTableUrl}/${dataset.id}/datafile`;
}

function buildUrlToDatafileTableContainingDatafile({
  datafile,
  facilityName,
}: {
  datafile: Datafile;
  facilityName: string;
}): string | null {
  const dataset = datafile.dataset;
  return dataset
    ? buildDatafileTableUrlForDataset({ dataset, facilityName })
    : null;
}

export {
  isLandingPageSupportedForHierarchy,
  buildInvestigationLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildDatasetLandingUrl,
  buildDatafileTableUrlForDataset,
  buildUrlToDatafileTableContainingDatafile,
};
