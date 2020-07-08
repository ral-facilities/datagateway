import React from 'react';
import { BugReport } from '@material-ui/icons';
import {
  Typography,
  withStyles,
  WithStyles,
  Theme,
  createStyles,
  Grid,
  CircularProgress,
  Link,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { compose } from 'redux';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      height: '100%',
    },
    bugIcon: {
      width: '5rem',
      height: '5rem',
      color: theme.palette.primary.main,
    },
    titleText: {
      fontWeight: 'bold',
      fontSize: '3rem',
      color: theme.palette.primary.main,
    },
    message: {
      maxWidth: 600,
      textAlign: 'center',
    },
  });

function withIdCheck(checkingPromise: Promise<boolean>) {
  return function WithIdCheck<T>(
    Component: React.ComponentType<T>
  ): React.ComponentType<T> {
    const WithIdCheckComponent: React.FC<
      T & WithStyles<typeof styles> & RouteComponentProps
    > = (props) => {
      const [loading, setLoading] = React.useState<boolean>(true);
      const [valid, setValid] = React.useState<boolean>(false);

      React.useEffect(() => {
        checkingPromise
          .then((valid) => {
            setValid(valid);
          })
          .catch(() => {
            setValid(false);
          })
          .finally(() => {
            setLoading(false);
          });
      }, []);

      const {
        classes,
        history,
        location,
        match,
        staticContext,
        ...componentProps
      } = props;

      if (loading) {
        return (
          <Grid
            container
            item
            direction="column"
            justify="center"
            alignItems="center"
            className={classes.container}
          >
            <CircularProgress />
            <Typography variant="body1">Verifying URL</Typography>
          </Grid>
        );
      } else {
        if (valid) {
          return <Component {...(componentProps as T)} />;
        } else {
          return (
            <Grid
              container
              item
              direction="column"
              justify="center"
              className={classes.container}
            >
              <Grid container item justify="center" alignItems="center">
                <BugReport className={classes.bugIcon} />
                <Typography variant="h1" className={classes.titleText}>
                  Oops!
                </Typography>
              </Grid>
              <Grid container item justify="center">
                <Typography variant="body1" className={classes.message}>
                  We&apos;re sorry, it seems as though the URL you requested is
                  attempting to fetch incorrect data. Please double check your
                  URL, navigate back via the breadcrumbs or{' '}
                  <Link
                    component={RouterLink}
                    to={props.location.pathname
                      .split('/')
                      .slice(0, 3)
                      .join('/')}
                  >
                    go back to the top level
                  </Link>
                  .
                </Typography>
              </Grid>
            </Grid>
          );
        }
      }
    };

    return compose<React.ComponentType<T>>(
      withRouter,
      withStyles(styles)
    )(WithIdCheckComponent);
  };
}

export default withIdCheck;
