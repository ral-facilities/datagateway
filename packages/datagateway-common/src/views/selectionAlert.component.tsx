import {
  Theme,
  IconButton,
  Grid,
  Paper,
  Typography,
  darken,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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

const selectionAlertStyles = makeStyles<Theme, SelectionAlertProps>(
  (theme: Theme) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectionAlertColor = (theme as any).colours?.warning;
    //Only have conditional as test will fail when null and the above comes from SciGateway
    const selectionAlertColorDark = selectionAlertColor
      ? darken(selectionAlertColor, 0.2)
      : 'orange';
    return createStyles({
      root: {
        backgroundColor: selectionAlertColor,
        color: 'black',
        width: ({ width }) => (width === undefined ? 'auto' : width),
        marginTop: '8px',
        marginLeft: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        marginRight: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        paddingTop: '2px',
        paddingBottom: '2px',
      },
      animate: {
        backgroundColor: selectionAlertColor,
        color: 'black',
        width: ({ width }) => (width === undefined ? 'auto' : `${width}`),
        marginTop: '8px',
        marginLeft: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        marginRight: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        paddingTop: '2px',
        paddingBottom: '2px',
        animation: `$pulsate 700ms ${theme.transitions.easing.easeInOut}`,
      },
      '@keyframes pulsate': {
        '0%': {
          backgroundColor: selectionAlertColor,
        },
        '25%': {
          backgroundColor: selectionAlertColorDark,
        },
        '50%': {
          backgroundColor: selectionAlertColor,
        },
        '75%': {
          backgroundColor: selectionAlertColorDark,
        },
        '100%': {
          backgroundColor: selectionAlertColor,
        },
      },
      text: {
        textAlign: 'center',
        justifyItems: 'center',
        alignItems: 'center',
        flex: '1',
      },
    });
  }
);

const SelectionAlert = React.memo(
  (props: {
    selectedItems: DownloadCartItem[];
    navigateToSelection: () => void;
    loggedInAnonymously: boolean;
    width?: string;
    marginSide?: string;
  }): React.ReactElement | null => {
    const classes = selectionAlertStyles({
      width: props.width,
      marginSide: props.marginSide,
    });
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
      <Paper
        aria-label="selection-alert"
        className={animating ? classes.animate : classes.root}
        onAnimationEnd={() => setAnimating(false)}
      >
        <Grid container>
          <Grid item className={classes.text}>
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
      </Paper>
    ) : null;
  }
);
SelectionAlert.displayName = 'SelectionAlert';

export default SelectionAlert;
