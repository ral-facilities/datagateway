import { type Datafile } from 'datagateway-common';
import { buildDatasetUrl } from '../urlBuilders';

async function buildDatafileUrl({
  facilityName,
  datafileId,
}: {
  datafileId: Datafile['id'];
  facilityName: string;
}): Promise<string | null> {

  if (!datafileId) return null;

  const datasetUrl = await buildDatasetUrl({
    facilityName,
    datasetId: datafileId,
  });
  return datasetUrl?.replace('dataset','datafile') || null;
}

export default buildDatafileUrl;
