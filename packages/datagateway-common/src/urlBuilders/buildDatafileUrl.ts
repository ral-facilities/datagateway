import type { Datafile } from '../app.types';
import buildDatasetUrl from './buildDatasetUrl';

/**
 * Given either a dataset ID or a {@link Datafile} object, constructs a URL to the {@link Datafile}.
 * The URL points to the dataset table the {@link Datafile} belongs to.
 *
 * @returns The URL to the dataset table that the datafile belongs to,
 *          or `null` if the URL cannot be constructed due to missing info.
 */
function buildDatafileUrl({
  facilityName,
  datafile,
}: {
  datafile: Datafile;
  facilityName: string;
}): string | null {
  const dataset = datafile.dataset;
  if (!dataset) return null;

  return buildDatasetUrl({
    facilityName,
    dataset,
    showLanding: false,
  });
}

export default buildDatafileUrl;
