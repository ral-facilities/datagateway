import ClearIcon from '@mui/icons-material/Clear';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ClearFilterProps {
  handleButtonClearFilters: () => void;
  disabled: boolean;
}

export const ClearFiltersButton = (
  props: ClearFilterProps
): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <Button
      className="tour-dataview-clear-filter-button"
      data-testid="clear-filters-button"
      variant="contained"
      color="primary"
      size="small"
      onClick={() => {
        props.handleButtonClearFilters();
      }}
      startIcon={<ClearIcon />}
      disabled={props.disabled}
    >
      {t('app.clear_filters')}
    </Button>
  );
};
export default ClearFiltersButton;
