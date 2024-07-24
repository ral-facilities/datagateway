import React from 'react';
import { Button, styled } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

export interface ClearFilterProps {
  handleButtonClearFilters: () => void;
  disabled: boolean;
}

const ButtonDiv = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(0.5)} 0px ${theme.spacing(0.5)} 0px`,
  marginRight: theme.spacing(0.5),
  display: 'inline-block',
}));

export const ClearFiltersButton = (
  props: ClearFilterProps
): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <ButtonDiv>
      <Button
        className="tour-dataview-clear-filter-button"
        data-testid="clear-filters-button"
        style={{ margin: '5px' }}
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
    </ButtonDiv>
  );
};
export default ClearFiltersButton;
