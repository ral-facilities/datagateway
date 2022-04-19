import {
  Button,
  createStyles,
  makeStyles,
  StyleRules,
  Theme,
} from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ClearFilterProps {
  handleButtonClearFilters: () => void;
  disabled: boolean;
}

const buttonStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      root: {
        padding: theme.spacing(0.5),
        display: 'inline-block',
      },
    })
);

export const ClearFiltersButton = (
  props: ClearFilterProps
): React.ReactElement => {
  const [t] = useTranslation();
  const classes = buttonStyles();

  return (
    <div className={classes.root}>
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
        startIcon={<Clear />}
        disabled={props.disabled}
      >
        {t('app.clear_filters')}
      </Button>
    </div>
  );
};

export default ClearFiltersButton;
