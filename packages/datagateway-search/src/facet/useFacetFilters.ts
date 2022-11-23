import React from 'react';
import { FiltersType, parseSearchToQuery } from 'datagateway-common';
import { useHistory, useLocation } from 'react-router-dom';

function useFacetFilters(): {
  selectedFacetFilters: FiltersType;
  addFacetFilter: (options: {
    dimension: string;
    filterValue: string;
    applyImmediately: boolean;
  }) => void;
  removeFacetFilter: (options: {
    dimension: string;
    filterValue: string;
    applyImmediately: boolean;
  }) => void;
  applyFacetFilters: () => void;
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

  const addFacetFilter = ({
    dimension,
    filterValue,
    applyImmediately,
  }: {
    dimension: string;
    filterValue: string;
    applyImmediately: boolean;
  }): void => {
    const filterKey = dimension.toLocaleLowerCase();

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
    filterValue: string;
    applyImmediately: boolean;
  }): void => {
    const filterKey = dimension.toLocaleLowerCase();

    setSelectedFacetFilters((prevFilter) => {
      const prevFilterValue = prevFilter[filterKey];
      if (!Array.isArray(prevFilterValue)) {
        return prevFilter;
      }

      // new facet filter excluding the classification label that has been unselected
      const dimensionFilters = prevFilterValue?.filter(
        (value) => value !== filterValue
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
    const filters = Object.entries(selectedFacetFilters).reduce<FiltersType>(
      (obj, [dimension, value]) => {
        obj[dimension.toLocaleLowerCase()] = value;
        return obj;
      },
      {}
    );
    searchParams.set('filters', JSON.stringify(filters));
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
  };
}

export default useFacetFilters;
