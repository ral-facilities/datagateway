import type { SearchResponse } from 'datagateway-common';
import type { ParameterValueFacet } from './parameterFilterTypes';

function parameterFacetsFromSearchResponse(
  response: SearchResponse
): ParameterValueFacet[] {
  if (!response.dimensions) return [];

  return Object.values(response.dimensions).flatMap((labelValues) =>
    Object.entries(labelValues).map(([label, value]) =>
      typeof value === 'object'
        ? {
            label,
            count: value.count,
            from: value.from,
            to: value.to,
          }
        : { label, count: value }
    )
  );
}

export default parameterFacetsFromSearchResponse;
