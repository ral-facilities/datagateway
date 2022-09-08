import {
  type AdditionalFilters,
  type FacilityCycle,
  fetchInvestigations,
  findInvestigationFacilityCycle,
  type Investigation,
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

  if (facilityName === 'ISIS') {
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
    // if neither an investigation object nor an investigation ID is provided, nothing can be built
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

export default buildInvestigationUrl;
