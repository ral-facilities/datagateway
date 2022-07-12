import {
  IconButton,
  Grid,
  Paper,
  Typography,
  darken,
  styled,
  keyframes,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DownloadCartItem, MicroFrontendId } from '../app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '../state/actions/actions.types';

const hasSentExpireMessage = (): boolean => {
  const storageValue = localStorage.getItem('sentExpiredMessage');
  return storageValue ? storageValue === '1' : false;
};

const storeHasSentExpireMessage = (value: boolean | null): void => {
  if (value === null) localStorage.removeItem('sentExpiredMessage');
  else localStorage.setItem('sentExpiredMessage', value ? '1' : '0');
};

//Note: By default auto fill to the avaiable space
type SelectionAlertProps = {
  width?: string;
  marginSide?: string;
};

const AnimatedPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'props' && prop !== 'animating',
})<{
  props: SelectionAlertProps;
  animating: boolean;
}>(({ theme, props, animating }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectionAlertColor = (theme as any).colours?.warning;
  //Only have conditional as test will fail when null and the above comes from SciGateway
  const selectionAlertColorDark = selectionAlertColor
    ? darken(selectionAlertColor, 0.2)
    : 'orange';

  const pulsate = keyframes`
    0% {
      background-color: ${selectionAlertColor};
    }
    25% {
      background-color: ${selectionAlertColorDark};
    }
    50% {
      background-color: ${selectionAlertColor};
    }
    75% {
      background-color: ${selectionAlertColorDark};
    }
    100% {
      background-color: ${selectionAlertColor};
    }`;

  return {
    backgroundColor: selectionAlertColor,
    color: 'black',
    width: props.width ?? 'auto',
    marginTop: '8px',
    marginLeft: props.marginSide ?? '0px',
    marginRight: props.marginSide ?? '0px',
    paddingTop: '2px',
    paddingBottom: '2px',
    animation: animating
      ? `${pulsate} 700ms ${theme.transitions.easing.easeInOut}`
      : undefined,
  };
});

const SelectionAlert = React.memo(
  (props: {
    selectedItems: DownloadCartItem[];
    navigateToSelection: () => void;
    loggedInAnonymously: boolean;
    width?: string;
    marginSide?: string;
  }): React.ReactElement | null => {
    const [t] = useTranslation();
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);
    const [alertText, setAlertText] = React.useState('');
    //Store number of selections on last update of this component (for keeping track of changes to cart)
    const [numSelectedItems, setNumSelectedItems] = React.useState(0);

    //Current number of selections
    const newNumSelecItems = props.selectedItems.length;

    const broadcastWarning = (message: string): void => {
      document.dispatchEvent(
        new CustomEvent(MicroFrontendId, {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'warning',
              message,
            },
          },
        })
      );
    };

    const sentExpiredMessage = hasSentExpireMessage();

    //Check for a change and assign text based on increase or decrease
    if (newNumSelecItems !== numSelectedItems) {
      const difference = newNumSelecItems - numSelectedItems;

      if (difference > 0) {
        setAlertText(t('selec_alert.added', { count: difference }));
        //Show a session expirey warning message if anonymous, have added items to the cart when
        //it was previously empty, and as long as the message hasn't already been shown to prevent
        //it showing when navigating between plugins
        if (
          props.loggedInAnonymously &&
          numSelectedItems === 0 &&
          !sentExpiredMessage
        ) {
          broadcastWarning(t('selec_alert.warning_message_session_token'));
          storeHasSentExpireMessage(true);
        }
      } else setAlertText(t('selec_alert.removed', { count: difference * -1 }));

      setNumSelectedItems(newNumSelecItems);
      //Change has occurred so need to ensure displayed
      setAlertOpen(true);
      setAnimating(true);
    }

    //Reset the expired message if there are no more items
    if (sentExpiredMessage && newNumSelecItems === 0)
      storeHasSentExpireMessage(null);

    return alertOpen ? (
      <AnimatedPaper
        aria-label="selection-alert"
        animating={animating}
        props={props}
        onAnimationEnd={() => setAnimating(false)}
      >
        <Grid container>
          <Grid
            item
            sx={{
              flex: '1',
              textAlign: 'center',
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            <Typography aria-label="selection-alert-text" display="inline">
              {alertText}
            </Typography>{' '}
            <button
              aria-label="selection-alert-link"
              style={{
                background: 'inherit',
                border: 'none',
                padding: '0!important',
                fontFamily: 'arial, sans-serif',
                color: '#040091',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={props.navigateToSelection}
            >
              {t('selec_alert.link')}
            </button>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="selection-alert-close"
              color="inherit"
              size="small"
              onClick={() => setAlertOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Grid>
        </Grid>
      </AnimatedPaper>
    ) : null;
  }
);
SelectionAlert.displayName = 'SelectionAlert';

export default SelectionAlert;
