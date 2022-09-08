import {
  type Datafile,
  type FacilityCycle,
  fetchDatafiles,
} from 'datagateway-common';
import { buildDatasetUrl } from '../urlBuilders';

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
    case 'ISIS':
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

export default buildDatafileUrl;
