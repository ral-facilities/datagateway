import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { BrowserRouter, useNavigate } from 'react-router';
import useFacetFilters from './useFacetFilters';

describe('useFacetFilters', () => {
  let buttonSearchParams: URLSearchParams;

  const ChangeSearchParamsButton = () => {
    const navigate = useNavigate();
    return (
      <button
        onClick={() => navigate({ search: buttonSearchParams.toString() })}
      >
        Change search params
      </button>
    );
  };

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <BrowserRouter>
        <>
          {children}
          <ChangeSearchParamsButton />
        </>
      </BrowserRouter>
    );
  }

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    buttonSearchParams = new URLSearchParams();
  });

  it('stores the currently selected filters', async () => {
    const user = userEvent.setup();

    const searchParam = new URLSearchParams();
    searchParam.append(
      'filters',
      JSON.stringify({
        'investigation.type.name': ['experiment'],
      })
    );
    buttonSearchParams = searchParam;

    const { result } = renderHook(() => useFacetFilters(), {
      wrapper: Wrapper,
    });
    // should be empty initially
    expect(result.current.selectedFacetFilters).toEqual({});

    await user.click(screen.getByRole('button'));

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
    });
    expect(window.location.search).toEqual('');

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
    });
    expect(window.location.search).toEqual('');

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
    });
    expect(window.location.search).toEqual('');
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

    let selectedFilters: unknown = {
      'investigation.type.name': ['experiment'],
    };

    let searchParams = new URLSearchParams();
    searchParams.append('filters', JSON.stringify(selectedFilters));
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
    });
    expect(window.location.search).toEqual(`?${searchParams.toString()}`);

    act(() => {
      result.current.addFacetFilter({
        dimension: 'investigationparameter.type.name',
        filterValue: 'bcat_inv_str',
        applyImmediately: true,
      });
    });

    selectedFilters = {
      'investigation.type.name': ['experiment'],
      'investigationparameter.type.name': ['bcat_inv_str'],
    };

    searchParams = new URLSearchParams();
    searchParams.append('filters', JSON.stringify(selectedFilters));
    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
    });
    expect(window.location.search).toEqual(`?${searchParams.toString()}`);
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
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${searchParamStr}`
    );

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
    });
    expect(window.location.search).toEqual(searchParamStr);

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
    });
    expect(window.location.search).toEqual(searchParamStr);

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
    });
    expect(window.location.search).toEqual(searchParamStr);
  });

  it('removes filters and apply the changes immediately when applyImmediately set to true', async () => {
    let searchParams = new URLSearchParams();
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

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${searchParamStr}`
    );

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
    });
    expect(window.location.search).toEqual(searchParamStr);

    act(() => {
      result.current.removeFacetFilter({
        dimension: 'investigation.type.name',
        filterValue: 'experiment',
        applyImmediately: true,
      });
    });

    const selectedFilters = {
      'investigationparameter.type.name': ['bcat_inv_str', 'run_number_after'],
    };

    searchParams = new URLSearchParams();
    searchParams.append('filters', JSON.stringify(selectedFilters));

    await waitFor(() => {
      expect(result.current.selectedFacetFilters).toEqual(selectedFilters);
    });
    expect(window.location.search).toEqual(`?${searchParams.toString()}`);
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
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${searchParams.toString()}`
    );

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
      expect(window.location.search).toEqual(`?${newSearchParams.toString()}`);
    });
    expect(result.current.selectedFacetFilters).toEqual({
      'investigation.type.name': ['experiment', 'calibration'],
      'investigationparameter.type.name': ['run_number_after'],
    });
  });
});
