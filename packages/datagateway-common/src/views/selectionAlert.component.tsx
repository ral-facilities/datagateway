import {
  Theme,
  createStyles,
  IconButton,
  makeStyles,
  Grid,
  Paper,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { DownloadCartItem } from '../app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

//Note: By default auto fill to the avaiable space
type SelectionAlertProps = {
  width?: string;
  marginSide?: string;
};

const selectionAlertStyles = makeStyles<Theme, SelectionAlertProps>(
  (theme: Theme) =>
    createStyles({
      root: {
        backgroundColor: 'orange',
        color: 'white',
        width: ({ width }) => (width === undefined ? 'auto' : width),
        marginTop: '8px',
        marginLeft: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        marginRight: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        padding: '3px',
        paddingBottom: '3px',
      },
      animate: {
        backgroundColor: 'orange',
        color: 'white',
        width: ({ width }) => (width === undefined ? 'auto' : `${width}`),
        marginTop: '8px',
        marginLeft: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        marginRight: ({ marginSide }) =>
          marginSide === undefined ? '0px' : marginSide,
        padding: '3px',
        paddingBottom: '3px',
        animation: `$pulsate 700ms ${theme.transitions.easing.easeInOut}`,
      },
      '@keyframes pulsate': {
        '0%': {
          backgroundColor: 'orange',
        },
        '25%': {
          backgroundColor: 'red',
        },
        '50%': {
          backgroundColor: 'orange',
        },
        '75%': {
          backgroundColor: 'red',
        },
        '100%': {
          backgroundColor: 'orange',
        },
      },
      text: {
        textAlign: 'center',
        justifyItems: 'center',
        alignItems: 'center',
        flex: '1',
      },
    })
);

const SelectionAlert = React.memo(
  (props: {
    selectedItems: DownloadCartItem[];
    width?: string;
    marginSide?: string;
  }): React.ReactElement => {
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

    //Check for a change and assign text based on increase or decrease
    if (newNumSelecItems !== numSelectedItems) {
      const difference = newNumSelecItems - numSelectedItems;

      //Obtain plural if needed
      const itemText =
        Math.abs(difference) > 1
          ? t('selec_alert.items')
          : t('selec_alert.item');

      if (difference > 0)
        setAlertText(`
            ${difference} ${itemText} ${t('selec_alert.added')}`);
      else
        setAlertText(`
            ${difference * -1} ${itemText} ${t('selec_alert.removed')}`);

      setNumSelectedItems(newNumSelecItems);
      //Change has occurred so need to ensure displayed
      setAlertOpen(true);
      setAnimating(true);
    }

    return (
      <React.Fragment>
        {alertOpen && (
          <Paper
            className={animating ? classes.animate : classes.root}
            onAnimationEnd={() => setAnimating(false)}
          >
            <Grid container alignItems="center">
              <Grid item className={classes.text}>
                <b>{alertText}</b>{' '}
                <Link to="/download">
                  <button
                    style={{
                      background: 'inherit',
                      border: 'none',
                      padding: '0!important',
                      fontFamily: 'arial, sans-serif',
                      color: '#069',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {t('selec_alert.link')}
                  </button>
                </Link>
              </Grid>
              <Grid item justify="flex-end">
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setAlertOpen(false)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        )}
      </React.Fragment>
    );
  }
);
SelectionAlert.displayName = 'SelectionAlert';

export default SelectionAlert;
