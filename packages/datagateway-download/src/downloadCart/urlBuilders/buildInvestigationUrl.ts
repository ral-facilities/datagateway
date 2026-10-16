import {
  type Investigation,
} from 'datagateway-common';

async function buildInvestigationUrl({
  facilityName,
  investigation: providedInvestigation,
  investigationId,
}: {
  investigation?: Investigation;
  investigationId?: Investigation['id'];
  facilityName: string;
}): Promise<string | null> {
  if (!investigationId && !providedInvestigation) {
    // if neither an investigation object nor an investigation ID is provided, nothing can be built
    // return nothing.
    return null;
  }
  if (investigationId) {
    return `/redirect/${facilityName}/investigation/id/${investigationId}`;
  }
   if (providedInvestigation) {
    return `/redirect/${facilityName}/investigation/id/${providedInvestigation?.id}`;
  }
}
export default buildInvestigationUrl;