import { Grid, Paper, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
// TODO: when vite 6, explore no-inline w/ pluginHost vs inline as we have to inline in vite 5
import DLSLogo from 'datagateway-common/src/images/DLS-logo-white-text.png';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  margin: theme.spacing(-1.5),
  padding: theme.spacing(1.5),
  paddingBottom: theme.spacing(3),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  // link color received from parent app theme object
  // this requires casting the theme to any so that we can explicitly
  // access properties we know to exist in the received object
  color: theme.palette.primary.contrastText,
  '& a': {
    '&:link': {
      color: '#FFCA98',
    },
    '&:visited': {
      color: '#FFCA98',
    },
    '&:active': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.red,
    },
  },
}));

const Branding = (): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <StyledPaper elevation={0}>
      <Grid container spacing={2}>
        <Grid item sm={12} md="auto" sx={{ display: 'flex' }}>
          <img
            style={{ height: 'auto', maxHeight: 90, margin: 'auto' }}
            src={DLSLogo}
            alt="Diamond Logo"
          />
        </Grid>
        <Grid item sm={12} md sx={{ display: 'flex' }}>
          <div style={{ margin: 'auto' }}>
            <StyledTypography
              variant="h4"
              aria-label="branding-title"
              align="center"
            >
              {t('doi_constants.branding.title')}
            </StyledTypography>
            <StyledTypography
              aria-label="branding-body"
              align="center"
              dangerouslySetInnerHTML={{
                __html: t('doi_constants.branding.body'),
              }}
            />
          </div>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default Branding;
