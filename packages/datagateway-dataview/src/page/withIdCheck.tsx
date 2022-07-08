import React from 'react';
import { BugReport } from '@mui/icons-material';
import { Typography, Grid, CircularProgress, Link } from '@mui/material';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { compose } from 'redux';
import { useTranslation, Trans } from 'react-i18next';

const containerStyle = { height: '100%' };

function withIdCheck(checkingPromise: Promise<boolean>) {
  return function WithIdCheck<T>(
    Component: React.ComponentType<T>
  ): React.ComponentType<T> {
    const WithIdCheckComponent: React.FC<T & RouteComponentProps> = (props) => {
      const [loading, setLoading] = React.useState<boolean>(true);
      const [valid, setValid] = React.useState<boolean>(false);
      const [t] = useTranslation();

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
            justifyContent="center"
            alignItems="center"
            sx={containerStyle}
          >
            <CircularProgress />
            <Typography variant="body1">{t('loading.verifying')}</Typography>
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
              justifyContent="center"
              sx={containerStyle}
            >
              <Grid container item justifyContent="center" alignItems="center">
                <BugReport
                  sx={{ width: '5rem', height: '5rem', color: 'primary.main' }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '3rem',
                    color: 'primary.main',
                  }}
                >
                  {t('loading.oops')}
                </Typography>
              </Grid>
              <Grid container item justifyContent="center">
                <Typography
                  variant="body1"
                  sx={{ maxWidth: '600px', textAlign: 'center' }}
                >
                  <Trans t={t} i18nKey="loading.message">
                    We&#39;re sorry, it seems as though the URL you requested is
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
                  </Trans>
                </Typography>
              </Grid>
            </Grid>
          );
        }
      }
    };

    return compose<React.ComponentType<T>>(withRouter)(WithIdCheckComponent);
  };
}

export default withIdCheck;
