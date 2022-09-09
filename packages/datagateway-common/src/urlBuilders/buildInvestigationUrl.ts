import type { Investigation } from '../app.types';

/**
 * Given an {@link Investigation} object, constructs a link to the {@link Investigation}.
 *
 * If providing an {@link Investigation} object, the {@link Investigation.investigationInstruments} field has to be present.
 *
 * @returns A URL to the investigation table, or `null` if the URL cannot be constructed due to missing info.
 */
function buildInvestigationUrl({
  facilityName,
  investigation,
  showLanding,
}: {
  investigation: Investigation;
  facilityName: string;
  showLanding: boolean;
}): string | null {
  const isISIS = /^isis$/i.test(facilityName);
  const isDLS = /^dls$/i.test(facilityName);

  if (!isISIS && !isDLS) {
    // is a generic facility, return a generic link to the investigation
    return investigation
      ? `/browse/investigation/${investigation.id}/dataset`
      : null;
  }

  if (isISIS) {
    const instrument = investigation?.investigationInstruments?.[0]?.instrument;
    const facilityCycle =
      investigation?.investigationFacilityCycles?.[0]?.facilityCycle;
    if (!instrument || !facilityCycle) return null;

    return `/browse/instrument/${instrument.id}/facilityCycle/${
      facilityCycle.id
    }/investigation/${investigation.id}${showLanding ? '' : '/dataset'}`;
  }

  if (isDLS) {
    return `/browse/proposal/${investigation.name}/investigation/${investigation.id}/dataset`;
  }

  return null;
}

export default buildInvestigationUrl;
