import React from 'react';
import { FiltersType } from 'datagateway-common';
import { Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SelectedFilterChipsProps {
  /**
   * The filters to be displayed by {@link SelectedFilterChips}
   */
  filters: FiltersType;
  /**
   * Called when the user removes a filter chip.
   */
  onRemoveFilter: (facetDimension: string, filterValue: string) => void;
}

/**
 * Displays the given filters as a row of removable chips.
 */
function SelectedFilterChips({
  filters,
  onRemoveFilter,
}: SelectedFilterChipsProps): JSX.Element {
  const [t] = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {Object.entries(filters).flatMap(([filterKey, filterValue]) => {
        if (!Array.isArray(filterValue)) return [];

        return filterValue.flatMap((value) =>
          typeof value === 'string'
            ? [
                <Chip
                  key={`${filterKey}:${value}`}
                  label={`${t(`facetDimensionLabel.${filterKey}`)}: ${value}`}
                  onDelete={() => {
                    onRemoveFilter(filterKey, value);
                  }}
                />,
              ]
            : []
        );
      })}
    </Stack>
  );
}

export default SelectedFilterChips;
