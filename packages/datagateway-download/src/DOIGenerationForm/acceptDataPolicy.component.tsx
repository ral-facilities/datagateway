import { Button, Grid, Link, Paper, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

type AcceptDataPolicyProps = {
  acceptDataPolicy: () => void;
};

const AcceptDataPolicy: React.FC<AcceptDataPolicyProps> = (props) => {
  const [t] = useTranslation();
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        // should take up page but leave room for: SG appbar, SG footer,
        // tabs, table padding.
        height: 'calc(100vh - 64px - 36px - 48px - 48px)',
      }}
    >
      <Paper
        variant="outlined"
        sx={{ padding: 1, textAlign: 'center', maxWidth: '50%' }}
      >
        <Grid container flexDirection="column">
          <Grid item>
            <Typography variant="body2" align="left">
              <Trans
                i18nKey="acceptDataPolicy.data_policy"
                components={{
                  Link: <Link />,
                }}
              />
            </Typography>
          </Grid>
          <Grid item alignSelf="end">
            <Button variant="contained" onClick={props.acceptDataPolicy}>
              {t('acceptDataPolicy.accept')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AcceptDataPolicy;
