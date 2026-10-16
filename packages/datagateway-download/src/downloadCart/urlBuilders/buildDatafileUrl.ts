import { type Datafile } from 'datagateway-common';
import { buildDatasetUrl } from '../urlBuilders';

async function buildDatafileUrl({
  facilityName,
  datafileId,
}: {
  datafileId: Datafile['id'];
  apiUrl: string;
  facilityName: string;
}): Promise<string | null> {
  const datafile = await fetchDatafile({ apiUrl, facilityName, datafileId });
  const dataset = datafile?.dataset;
  if (!dataset) return null;

  return buildDatasetUrl({
    facilityName,
    dataset,
  });
}

export default buildDatafileUrl;
