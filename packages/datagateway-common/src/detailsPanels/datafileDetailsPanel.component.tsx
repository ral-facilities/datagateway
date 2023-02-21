import React from 'react';
import { Typography, Grid, Divider, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Datafile, Entity } from '../app.types';
import { formatBytes } from '../table/cellRenderers/cellContentRenderers';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface DatafileDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize } = props;

  const [t] = useTranslation();
  const datafileData = props.rowData as Datafile;

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
    <StyledGrid id="details-panel" container direction="column">
      <Grid item xs>
        <Typography variant="h6">
          <b>{datafileData.name}</b>
        </Typography>
        <StyledDivider />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datafiles.size')}</Typography>
        <Typography>
          <b>{formatBytes(datafileData.fileSize)}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datafiles.location')}</Typography>
        <Typography>
          <b>{datafileData.location}</b>
        </Typography>
      </Grid>
    </StyledGrid>
  );
};

export default DatafileDetailsPanel;
