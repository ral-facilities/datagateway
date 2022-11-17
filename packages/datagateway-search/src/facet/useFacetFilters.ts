import React from 'react';
import { FiltersType, parseSearchToQuery } from 'datagateway-common';
import { useHistory, useLocation } from 'react-router-dom';

function useFacetFilters(): {
  selectedFacetFilters: FiltersType;
  addFacetFilter: (dimension: string, filterValue: string) => void;
  removeFacetFilter: (dimension: string, filterValue: string) => void;
  applyFacetFilters: () => void;
} {
  const location = useLocation();
  const { push } = useHistory();
  const { filters } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const [selectedFacetFilters, setSelectedFacetFilters] =
    React.useState<FiltersType>({});

  React.useEffect(() => {
    console.log('useEffect', filters);
    setSelectedFacetFilters(filters);
  }, [filters]);

  const addFacetFilter = (dimension: string, filterValue: string): void => {
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
  };

  const removeFacetFilter = (dimension: string, filterValue: string): void => {
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
  };

  const applyFacetFilters = (): void => {
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
  };

  return {
    selectedFacetFilters,
    addFacetFilter,
    removeFacetFilter,
    applyFacetFilters,
  };
}

export default useFacetFilters;
