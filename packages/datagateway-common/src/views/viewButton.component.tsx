import { Button, styled } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

export interface ViewProps {
  viewCards: boolean;
  handleButtonChange: () => void;
  disabled?: boolean;
}

const ButtonDiv = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(0.5)} 0px ${theme.spacing(0.5)} 0px`,
  marginRight: theme.spacing(0.5),
  display: 'inline-block',
}));

const ViewButton = (props: ViewProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <ButtonDiv>
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
    </ButtonDiv>
  );
};

export default ViewButton;
