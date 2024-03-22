/**
 * This package contains everything related to faceting of search data.
 *
 * # What is faceting?
 * Faceting, or faceted search, is a technique of searching that allows the users to filter/narrow data
 * based on classifications of items in the data.
 *
 * For example, faceted search can be performed on a list of phones to find a specific brand of phone,
 * or phones within a specified price range. The brand and the price of the phones are called *facets*,
 * hence the term "faceted search" - searches are classified by different facets. Facets can also be:
 *
 * - the storage capacity of the phone
 * - the display size of the phone
 * - the type of the charging port (USB-C? micro USB?)
 *
 * ## datagateway-search
 * In the context of datagateway-search, search data can be faceted based on different facets (also called dimensions).
 * For example, search results for Investigations can be filtered based on the investigation type.
 *
 * What filters are available depends on what is returned in the search response ({@link SearchResponse}).
 * The `dimensions` property contains dimensions that the results can be filtered on.
 * For example, the dimensions of a search response for searching through investigations can look like this:
 *
 * ```
 * {
 *   dimensions: {
 *     'Investigation.type.name': {
 *       calibration: 100,
 *       experiment: 234,
 *     }
 *   }
 * }
 * ```
 *
 * The dimensions object indicates that there are 100 investigations that are of type 'calibration', and 234 that are of type 'experiment'.
 * 'Investigation.type.name' can be seen as a path that drills down to the InvestigationType entity, which has a `name` field:
 *
 * ```
 * Investigation entity {
 *   `type` field: InvestigationType (1..1) {
 *     name: string
 *   }
 * }
 * ```
 *
 * This link provides the schema for the Investigation entity. https://repo.icatproject.org/site/icat/server/5.0.0/schema.html#Investigation
 *
 * Based on that dimensions object, the search results can be filtered by `Investigation.type.name` (investigation type).
 * For example, "only show investigations that have type "calibration").
 * This filtering operation can be done through `FacetPanel`.
 *
 * @see https://repo.icatproject.org/site/icat/server/5.0.0/schema.html
 * @see https://en.wikipedia.org/wiki/Faceted_search
 * @see https://www.algolia.com/blog/ux/faceted-search-an-overview/
 */
export {};
