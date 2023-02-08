import React from 'react';
import {
  FiltersType,
  parseSearchToQuery,
  SearchFilter,
} from 'datagateway-common';
import { useHistory, useLocation } from 'react-router-dom';
import isEqual from 'lodash.isequal';

function useFacetFilters(): {
  selectedFacetFilters: FiltersType;
  addFacetFilter: (options: {
    dimension: string;
    filterValue: SearchFilter;
    applyImmediately: boolean;
  }) => void;
  removeFacetFilter: (options: {
    dimension: string;
    filterValue: SearchFilter;
    applyImmediately: boolean;
  }) => void;
  applyFacetFilters: () => void;
  haveUnappliedFilters: boolean;
} {
  const location = useLocation();
  const { push } = useHistory();
  const { filters } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const [isImmediateUpdateRequired, setIsImmediateUpdateRequired] =
    React.useState(false);
  const [selectedFacetFilters, setSelectedFacetFilters] =
    React.useState<FiltersType>({});

  const haveUnappliedFilters = !isEqual(filters, selectedFacetFilters);

  const addFacetFilter = ({
    dimension,
    filterValue,
    applyImmediately,
  }: {
    dimension: string;
    filterValue: SearchFilter;
    applyImmediately: boolean;
  }): void => {
    const filterKey = dimension;

    setSelectedFacetFilters((prevFilter) => {
      const prevFilterValue = prevFilter[filterKey];
      if (!prevFilterValue) {
        return {
          ...prevFilter,
          [filterKey]: [filterValue],
        };
      }
      if (Array.isArray(prevFilterValue)) {
        return {
          ...prevFilter,
          [filterKey]: [...prevFilterValue, filterValue],
        };
      }
      return prevFilter;
    });
    setIsImmediateUpdateRequired(applyImmediately);
  };

  const removeFacetFilter = ({
    dimension,
    filterValue,
    applyImmediately,
  }: {
    dimension: string;
    filterValue: SearchFilter;
    applyImmediately: boolean;
  }): void => {
    const filterKey = dimension;

    setSelectedFacetFilters((prevFilter) => {
      const prevFilterValue = prevFilter[filterKey];
      if (!Array.isArray(prevFilterValue)) {
        return prevFilter;
      }

      // new facet filters excluding the filter that should be removed
      const dimensionFilters = prevFilterValue?.filter(
        (value) => !isEqual(value, filterValue)
      );

      if (dimensionFilters && dimensionFilters.length > 0) {
        return {
          ...prevFilter,
          [filterKey]: dimensionFilters,
        };
      }

      const { [filterKey]: _, ...rest } = prevFilter;
      return rest;
    });
    setIsImmediateUpdateRequired(applyImmediately);
  };

  const applyFacetFilters = React.useCallback((): void => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('filters', JSON.stringify(selectedFacetFilters));
    push({ search: `?${searchParams.toString()}` });
  }, [location.search, push, selectedFacetFilters]);

  React.useEffect(() => {
    setSelectedFacetFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    if (isImmediateUpdateRequired) {
      applyFacetFilters();
      setIsImmediateUpdateRequired(false);
    }
  }, [applyFacetFilters, isImmediateUpdateRequired]);

  return {
    selectedFacetFilters,
    addFacetFilter,
    removeFacetFilter,
    applyFacetFilters,
    haveUnappliedFilters,
  };
}

export default useFacetFilters;
