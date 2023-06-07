import { Button, Grid, Paper, Typography } from '@mui/material';
import React from 'react';

type AcceptDataPolicyProps = {
  acceptDataPolicy: () => void;
};

const AcceptDataPolicy: React.FC<AcceptDataPolicyProps> = (props) => {
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
            {/* TODO: write data policy text */}
            <Typography variant="body2">
              Accept data policy: Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
              occaecat cupidatat non proident, sunt in culpa qui officia
              deserunt mollit anim id est laborum.
            </Typography>
          </Grid>
          <Grid item alignSelf="end">
            <Button onClick={props.acceptDataPolicy}>Accept</Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AcceptDataPolicy;
