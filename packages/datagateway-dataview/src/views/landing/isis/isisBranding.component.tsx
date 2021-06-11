import {
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import STFCLogoWhite from 'datagateway-common/src/images/stfc-logo-white-text.png';
import { StateType } from '../../../state/app.types';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      backgroundColor: theme.palette.primary.light,
      margin: -theme.spacing(1.5),
      padding: theme.spacing(1.5),
      paddingBottom: theme.spacing(3),
    },
    typography: {
      color: theme.palette.primary.contrastText,
      '& a': {
        '&:link': {
          color: '#FF6900',
        },
        '&:visited': {
          color: '#FF6900',
        },
        '&:active': {
          color: '#E94D36',
        },
      },
    },
    logo: {
      height: 'auto',
      maxHeight: 90,
      margin: 'auto',
    },
    textDiv: {
      margin: 'auto',
    },
    gridItem: {
      display: 'flex',
    },
  })
);

const Branding = (props: { pluginHost: string }): React.ReactElement => {
  const pluginHost = props.pluginHost;
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <Paper elevation={0} className={classes.paper}>
      <Grid container spacing={2}>
        <Grid item sm={12} md="auto" className={classes.gridItem}>
          <img
            className={classes.logo}
            src={pluginHost + STFCLogoWhite}
            alt=""
          />
        </Grid>
        <Grid item sm={12} md className={classes.gridItem}>
          <div className={classes.textDiv}>
            <Typography
              className={classes.typography}
              component="h4"
              variant="h4"
              aria-label="branding-title"
              align="center"
            >
              {t('doi_constants.branding.title')}
            </Typography>
            <Typography
              className={classes.typography}
              aria-label="branding-body"
              align="center"
              dangerouslySetInnerHTML={{
                __html: t('doi_constants.branding.body'),
              }}
            />
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

const mapStateToProps = (state: StateType): { pluginHost: string } => {
  return {
    pluginHost: state.dgdataview.pluginHost,
  };
};

export default connect(mapStateToProps)(Branding);
