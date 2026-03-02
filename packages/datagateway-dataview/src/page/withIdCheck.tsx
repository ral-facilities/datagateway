import BugReport from '@mui/icons-material/BugReport';
import { CircularProgress, Grid, Link, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const containerStyle = { height: '100%' };

const WithIdCheck: React.FC<{
  checkingPromise: Promise<boolean>;
  children: React.ReactNode;
}> = (props) => {
  const { checkingPromise, children } = props;
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
  }, [checkingPromise]);

  const location = useLocation();

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
      return children;
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
                  to={location.pathname.split('/').slice(0, 3).join('/')}
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

export default WithIdCheck;
