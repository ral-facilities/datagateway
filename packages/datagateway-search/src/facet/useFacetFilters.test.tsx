import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useFacetFilters from './useFacetFilters';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';

describe('useFacetFilters', () => {
  let history: MemoryHistory;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return <Router history={history}>{children}</Router>;
  }

  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('stores the currently selected filters', () => {
    const { result, rerender } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });
    // should be empty initially
    expect(result.current.selectedFacetFilters).toEqual({});

    const searchParam = new URLSearchParams();
    searchParam.append(
      'filters',
      JSON.stringify({
        'investigation.type.name': ['experiment'],
      })
    );
    history.push({ search: `?${searchParam.toString()}` });

    rerender();

    expect(result.current.selectedFacetFilters).toEqual({
      'investigation.type.name': ['experiment'],
    });
  });

  it('adds filter without applying the changes', async () => {
    const { result, waitFor } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    result.current.addFacetFilter('investigation.type.name', 'experiment');

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment'],
      });
      expect(history.location.search).toEqual('');
    });

    result.current.addFacetFilter('investigation.type.name', 'calibration');

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment', 'calibration'],
      });
      expect(history.location.search).toEqual('');
    });

    result.current.addFacetFilter(
      'investigationparameter.type.name',
      'run_number_after'
    );

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment', 'calibration'],
        'investigationparameter.type.name': ['run_number_after'],
      });
      expect(history.location.search).toEqual('');
    });
  });

  it('removes filters without applying the changes', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append(
      'filters',
      JSON.stringify({
        'investigation.type.name': ['experiment'],
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      })
    );

    const searchParamStr = `?${searchParams.toString()}`;
    history.replace({ search: searchParamStr });

    const { result, waitFor } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    // try to remove something not in the filter
    result.current.removeFacetFilter('investigation.type.name', 'calibration');
    // nothing should be changed
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment'],
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      });
      expect(history.location.search).toEqual(searchParamStr);
    });

    result.current.removeFacetFilter('investigation.type.name', 'experiment');
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      });
      expect(history.location.search).toEqual(searchParamStr);
    });

    result.current.removeFacetFilter(
      'investigationparameter.type.name',
      'bcat_inv_str'
    );
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigationparameter.type.name': ['run_number_after'],
      });
      expect(history.location.search).toEqual(searchParamStr);
    });
  });

  it('applies the update filters to the URL when requested', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append(
      'filters',
      JSON.stringify({
        'investigation.type.name': ['experiment'],
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      })
    );
    history.replace({ search: `?${searchParams.toString()}` });

    const { result, waitFor } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    result.current.addFacetFilter('investigation.type.name', 'calibration');
    result.current.removeFacetFilter(
      'investigationparameter.type.name',
      'bcat_inv_str'
    );
    result.current.applyFacetFilters();

    const newSearchParams = new URLSearchParams();
    newSearchParams.append(
      'filters',
      JSON.stringify({
        'investigation.type.name': ['experiment', 'calibration'],
        'investigationparameter.type.name': ['run_number_after'],
      })
    );

    await waitFor(() => {
      expect(history.location.search).toEqual(`?${newSearchParams.toString()}`);
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment', 'calibration'],
        'investigationparameter.type.name': ['run_number_after'],
      });
    });
  });
});
