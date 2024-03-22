import parameterFacetsFromSearchResponse from './parameterFacetsFromSearchResponse';
import { ParameterValueFacet } from './parameterFilterTypes';

describe('parameterFacetsFromSearchResponse', () => {
  it('extract facets on parameters from search result dimensions (facets)', () => {
    expect(
      parameterFacetsFromSearchResponse({
        dimensions: {
          investigationparameters: {
            bcat_inv_str: 123,
            run_number_range: {
              from: 1,
              to: 10,
              count: 234,
            },
          },
        },
      })
    ).toEqual<ParameterValueFacet[]>([
      {
        label: 'bcat_inv_str',
        count: 123,
      },
      {
        label: 'run_number_range',
        from: 1,
        to: 10,
        count: 234,
      },
    ]);
  });

  it('returns an empty array if the search result object does not contain facets', () => {
    expect(parameterFacetsFromSearchResponse({ results: [] })).toEqual<
      ParameterValueFacet[]
    >([]);
  });
});
