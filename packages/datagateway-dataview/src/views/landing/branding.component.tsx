import { Grid, Link, Paper, styled, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StateType } from '../../state/app.types';
// TODO: when vite 6, explore no-inline w/ pluginHost vs inline as we have to inline in vite 5
import STFCLogoWhite from 'datagateway-common/src/images/stfc-logo-white-text.png';
// TODO: when vite 6, explore no-inline w/ pluginHost vs inline as we have to inline in vite 5
import DLSLogo from 'datagateway-common/src/images/DLS-logo-white-text.png';
import { useSelector } from 'react-redux';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  margin: theme.spacing(-1.5),
  padding: theme.spacing(1.5),
  paddingBottom: theme.spacing(3),
}));

const Branding = (props: {
  landingPageType: 'data' | 'instrument';
}): React.ReactElement => {
  const [t] = useTranslation();
  const landingPageLogo = useSelector(
    (state: StateType) => state.dgdataview.landingPageLogo
  );

  return (
    <StyledPaper elevation={0}>
      <Grid container spacing={2}>
        {landingPageLogo && (
          <Grid item sm={12} md="auto" sx={{ display: 'flex' }}>
            <img
              style={{ height: 'auto', maxHeight: 90, margin: 'auto' }}
              src={
                landingPageLogo === 'STFC'
                  ? STFCLogoWhite
                  : landingPageLogo === 'DLS'
                    ? DLSLogo
                    : landingPageLogo
              }
              alt={t('doi_constants.branding.logo_alt_text')}
            />
          </Grid>
        )}
        <Grid item sm={12} md sx={{ display: 'flex' }}>
          <div style={{ margin: 'auto' }}>
            <Typography
              color="primary.contrastText"
              variant="h4"
              align="center"
            >
              {t('doi_constants.branding.title')}
            </Typography>
            <Typography color="primary.contrastText" align="center">
              <Trans
                i18nKey={t('doi_constants.branding.body', {
                  context: props.landingPageType,
                })}
                components={{ Link: <Link color="#FFCA98" /> }}
              />
            </Typography>
          </div>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default Branding;
