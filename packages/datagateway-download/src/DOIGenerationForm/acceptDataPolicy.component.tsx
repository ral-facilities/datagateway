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
            <Typography variant="body2">
              Accept data policy wrghwurgh ergue rgeyrg erug er geurygerygueyrg
              e rgeuygeurguerg rg ergyerg erg erg erg erg ergyeurgyuerg er
              gerygueryg e rgeryguyerigy ergi er gery gergu i fg ewuefhuwef wef
              wef weufw eufw ef wef wefiw efiwue f wefyweufy wfe wefy wfe
              wiefwuiefi wue fw feiuwe fuwye uiewy fiwey fwy fewiufy iwyiefyiwue
              f
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
