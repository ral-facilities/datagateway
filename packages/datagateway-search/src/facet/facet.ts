import { SearchResponse } from 'datagateway-common';

/**
 * Stores the result of performing faceted search on a search result set.
 * It maps names of the facets used for the search (field names of the targeted/faceted entity) to
 * a map that classifies the search result set in that facet.
 *
 * For example, let's say a list of entity called `Phone` is faceted.
 * The result is stored as `FacetDimensions`. Here is an example of the `FacetDimensions`:
 * ```
 * { // FacetResults
 *   "Phone.color": { // FacetValues, classifies the list of phones by Phone.color field.
 *     "black": 100,
 *     "white": 99,
 *   }
 *   // Nested field (Phone.manufacturer is a "Manufacturer" entity)
 *   "Phone.manufacturer.name": { // FacetDimensionValues, classifies the list of phones by `Phone.manufacturer.name` field.
 *     "sungsam": 23,
 *     "orange": 176,
 *   }
 * }
 * ```
 *
 * The example tells us:
 * - In the list, there are 100 `Phone` with the `color` field being to `"black"`, 99 for `"white"`.
 * - In the list, there are 23 `Phone`s manufactured by sungsam, 176 manufactured by orange.
 */
type FacetClassification = Record<string, FacetClassificationValues>;

/**
 * Describes the search result set under a certain facet.
 * Maps the values of facet (field name of the targeted entity)
 * to the number of entities whose field has that value.
 *
 * For example, let's say FacetDimensionValues contains values of a facet dimension
 * called "colors" on the "Phone" entity. In this case, FacetDimensionValues can look like this:
 * ```
 * {
 *   "black": 100,
 *   "white": 99,
 * }
 * ```
 * It shows that there are 100 `Phone` entities whose `color` field has the value `"black"`,
 * and 99 `Phone`s whose `color` field has the value `"white"`.
 * In English, it means that there are 100 black phones and 99 white phones.
 */
type FacetClassificationValues = Record<string, number | undefined>;

/**
 * Combines facet objects in each {@link SearchResponse} in the given array into one
 * facet objects.
 *
 * Example:
 * ```
 * const response = [
 *   {
 *     dimensions: {
 *       'Investigation.type.name': {
 *         type1: 2,
 *         type2: 4,
 *       }
 *     },
 *     ...
 *   },
 *   {
 *     dimensions: {
 *       'Investigation.type.name': {
 *         type1: 4,
 *         type3: 3,
 *       },
 *       'InvestigationParameter.type.name': {
 *          param: 6
 *       }
 *     },
 *     ...
 *   }
 * ]
 *
 * const facets = facetClassificationFromSearchResponses(responses)
 * {
 *   dimensions: {
 *     'Investigation.type.name': {
 *       type1: 6,
 *       type2: 4,
 *       type3: 3,
 *     },
 *     'InvestigationParameter.type.name': {
 *       param: 6
 *     }
 *   }
 * }
 * ```
 *
 * @param responses
 */
function facetClassificationFromSearchResponses(
  responses: SearchResponse[]
): FacetClassification {
  return responses.reduce<FacetClassification>((facets, searchResponse) => {
    if (!searchResponse.dimensions) return facets;

    // combine the facet object of this search response with other ones
    // object shape example:
    // {
    //   'Investigation.type.name': {
    //     type1: 2,
    //     type2: 3,
    //   },
    //   'InvestigationParameter.type.name': {
    //     ...
    //   }
    // }
    for (const [dimension, classifications] of Object.entries(
      searchResponse.dimensions
    )) {
      if (!(dimension in facets)) {
        // classification doesn't exist yet under this dimension
        // in the result object
        // create a blank object so that the classifications can be written into this object
        facets[dimension] = {};
      }

      // "classifications" object example
      // {
      //   type1: 2,
      //   type2: 3,
      //   type3: {
      //     count: 4
      //   }
      // }

      const otherClassifications = facets[dimension];
      for (const [classification, value] of Object.entries(classifications)) {
        // the number of search items under this classification
        const classificationCount =
          typeof value === 'object' ? value.count : value;

        if (
          classification in otherClassifications &&
          typeof classificationCount !== 'undefined' &&
          typeof otherClassifications[classification] !== 'undefined'
        ) {
          // combine count with other existing classifications
          // type-cast as number since we check for not undefined above but TS isn't happy
          (otherClassifications[classification] as number) +=
            classificationCount;
        } else {
          // classification under this dimension doesn't exist yet
          // add this to the final object
          otherClassifications[classification] = classificationCount;
        }
      }
    }

    return facets;
  }, {});
}

export type { FacetClassification, FacetClassificationValues };
export { facetClassificationFromSearchResponses };
