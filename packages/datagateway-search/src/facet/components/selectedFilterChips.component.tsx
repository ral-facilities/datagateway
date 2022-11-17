import React from 'react';
import { FiltersType } from 'datagateway-common';
import { Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SelectedFilterChipsProps {
  filters: FiltersType;
  onRemoveFilter: (facetDimension: string, filterValue: string) => void;
}

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
                    console.log('onRemoveFilter', { filterKey, value });
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
