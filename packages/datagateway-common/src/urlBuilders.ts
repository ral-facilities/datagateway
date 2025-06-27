import {
  Datafile,
  FACILITY_NAME,
  type Dataset,
  type Investigation,
} from './app.types';

function isLandingPageSupportedForHierarchy(hierarchy: string): boolean {
  return hierarchy === FACILITY_NAME.isis;
}

type SearchResultSourceConstructedInvestigation = {
  id: number;
  name: string;
  instrumentId: number | undefined;
  facilityCycleId: number | undefined;
};

function buildInvestigationLandingUrl(
  investigation: Investigation | SearchResultSourceConstructedInvestigation
): string | null {
  const instrumentId =
    'instrumentId' in investigation
      ? investigation.instrumentId
      : investigation?.investigationInstruments?.[0]?.instrument?.id;
  const facilityCycleId =
    'facilityCycleId' in investigation
      ? investigation.facilityCycleId
      : investigation?.investigationFacilityCycles?.[0]?.facilityCycle?.id;
  if (!instrumentId || !facilityCycleId) return null;

  return `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigation.id}`;
}

function buildDatasetTableUrlForInvestigation({
  facilityName,
  investigation,
}: {
  investigation: Investigation | SearchResultSourceConstructedInvestigation;
  facilityName: string;
}): string | null {
  const isISIS =
    facilityName.toLowerCase() === FACILITY_NAME.isis.toLowerCase();
  const isDLS = facilityName.toLowerCase() === FACILITY_NAME.dls.toLowerCase();

  if (!isISIS && !isDLS) {
    // is a generic facility, return a generic link to the investigation
    return `/browse/investigation/${investigation.id}/dataset`;
  }

  if (isISIS) {
    const instrumentId =
      'instrumentId' in investigation
        ? investigation.instrumentId
        : investigation?.investigationInstruments?.[0]?.instrument?.id;
    const facilityCycleId =
      'facilityCycleId' in investigation
        ? investigation.facilityCycleId
        : investigation?.investigationFacilityCycles?.[0]?.facilityCycle?.id;
    if (!instrumentId || !facilityCycleId) return null;

    return `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigation.id}/dataset`;
  }

  if (isDLS) {
    return `/browse/proposal/${investigation.name}/investigation/${investigation.id}/dataset`;
  }

  return null;
}

type SearchResultSourceConstructedDataset = {
  id: number;
  name: string;
  investigation: SearchResultSourceConstructedInvestigation;
};

function buildDatasetLandingUrl(
  dataset: Dataset | SearchResultSourceConstructedDataset
): string | null {
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
  dataset: Dataset | SearchResultSourceConstructedDataset;
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

type SearchResultSourceConstructedDatafile = {
  id: number;
  name: string;
  dataset: SearchResultSourceConstructedDataset;
};

function buildUrlToDatafileTableContainingDatafile({
  datafile,
  facilityName,
}: {
  datafile: Datafile | SearchResultSourceConstructedDatafile;
  facilityName: string;
}): string | null {
  const dataset = datafile.dataset;
  return dataset
    ? buildDatafileTableUrlForDataset({ dataset, facilityName })
    : null;
}

export {
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  buildUrlToDatafileTableContainingDatafile,
  isLandingPageSupportedForHierarchy,
};
