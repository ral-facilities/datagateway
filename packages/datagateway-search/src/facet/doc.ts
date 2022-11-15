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
 * # datagateway-search
 * In the context of datagateway-search, search data can be faceted by passing {@link FacetRequest}
 * to the search API call:
 *
 * - `FacetRequest.target`: The name of the entity (that is linked to the search data) to be used to perform faceted search.
 *   For example, `Investigation` can be a target, which requests the data to be classified using its own fields,
 *   like `Investigation.type`.
 *   `InvestigationParameter` can also be a target, which classifies `Investigation`s based on the parameters that each has.
 *   (Side note: the reason why `InvestigationParameter` isn't included in the `Investigation` target,
 *   even though there is `Investigation.parameters` field, is because each investigation can have multiple parameters.
 *   Therefore, it has to be requested separately unlike `InvestigationType`, the entity for `Investigation.type`,
 *   which has a 1 to 1 relationship to `Investigation` (each `Investigation` can only have 1 `InvestigationType`))
 */

export {};
