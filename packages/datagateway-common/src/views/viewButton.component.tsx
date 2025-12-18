import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ViewProps {
  viewCards: boolean;
  handleButtonChange: () => void;
  disabled?: boolean;
}

const ViewButton = (props: ViewProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
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
  );
};

export default ViewButton;
