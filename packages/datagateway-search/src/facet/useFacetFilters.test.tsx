import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryHistory, createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';
import useFacetFilters from './useFacetFilters';

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

    act(() => {
      history.push({ search: `?${searchParam.toString()}` });
    });

    rerender();

    expect(result.current.selectedFacetFilters).toEqual({
      'investigation.type.name': ['experiment'],
    });
  });

  it('adds filter without applying the changes', async () => {
    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'experiment',
        applyImmediately: false,
      });
    });

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment'],
      });
      expect(history.location.search).toEqual('');
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'calibration',
        applyImmediately: false,
      });
    });

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment', 'calibration'],
      });
      expect(history.location.search).toEqual('');
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigationparameter.type.name',
        filterValue: 'run_number_after',
        applyImmediately: false,
      });
    });

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigation.type.name': ['experiment', 'calibration'],
        'investigationparameter.type.name': ['run_number_after'],
      });
      expect(history.location.search).toEqual('');
    });
  });

  it('adds filters and apply the changes immediately when applyImmediately set to true', async () => {
    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'experiment',
        applyImmediately: true,
      });
    });

    await waitFor(() => {
      const selectedFilters = {
        'investigation.type.name': ['experiment'],
      };

      const searchParams = new URLSearchParams();
      searchParams.append('filters', JSON.stringify(selectedFilters));

      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
      expect(history.location.search).toEqual(`?${searchParams.toString()}`);
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigationparameter.type.name',
        filterValue: 'bcat_inv_str',
        applyImmediately: true,
      });
    });

    await waitFor(() => {
      const selectedFilters = {
        'investigation.type.name': ['experiment'],
        'investigationparameter.type.name': ['bcat_inv_str'],
      };

      const searchParams = new URLSearchParams();
      searchParams.append('filters', JSON.stringify(selectedFilters));

      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
      expect(history.location.search).toEqual(`?${searchParams.toString()}`);
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

    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    // try to remove something not in the filter
    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'calibration',
        applyImmediately: false,
      });
    });
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

    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'experiment',
        applyImmediately: false,
      });
    });
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      });
      expect(history.location.search).toEqual(searchParamStr);
    });

    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigationparameter.type.name',
        filterValue: 'bcat_inv_str',
        applyImmediately: false,
      });
    });
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual({
        'investigationparameter.type.name': ['run_number_after'],
      });
      expect(history.location.search).toEqual(searchParamStr);
    });
  });

  it('removes filters and apply the changes immediately when applyImmediately set to true', async () => {
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

    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    // try to remove something not in the filter
    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'calibration',
        applyImmediately: true,
      });
    });
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

    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'experiment',
        applyImmediately: true,
      });
    });

    await waitFor(() => {
      const selectedFilters = {
        'investigationparameter.type.name': [
          'bcat_inv_str',
          'run_number_after',
        ],
      };

      const searchParams = new URLSearchParams();
      searchParams.append('filters', JSON.stringify(selectedFilters));

      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
      expect(history.location.search).toEqual(`?${searchParams.toString()}`);
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

    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'calibration',
        applyImmediately: false,
      });
    });
    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigationparameter.type.name',
        filterValue: 'bcat_inv_str',
        applyImmediately: false,
      });
    });
    act(() => {
      result.current.applyFacetFilters();
    });

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
