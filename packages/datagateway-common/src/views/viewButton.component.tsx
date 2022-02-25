import {
  Button,
  createStyles,
  makeStyles,
  StyleRules,
  Theme,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda';

export interface ViewProps {
  viewCards: boolean;
  handleButtonChange: () => void;
  disabled?: boolean;
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
const ViewButton = (props: ViewProps): React.ReactElement => {
  const [t] = useTranslation();
  const classes = buttonStyles();

  return (
    <div className={classes.root}>
      <Button
        className="tour-dataview-view-button"
        aria-label={`page view ${
          props.viewCards ? t('app.view_table') : t('app.view_cards')
        }`}
        variant="contained"
        color="primary"
        size="small"
        startIcon={props.viewCards ? <ViewListIcon /> : <ViewAgendaIcon />}
        onClick={() => props.handleButtonChange()}
        disabled={props.disabled ?? false}
      >
        {props.viewCards ? t('app.view_table') : t('app.view_cards')}
      </Button>
    </div>
  );
};

export default ViewButton;
