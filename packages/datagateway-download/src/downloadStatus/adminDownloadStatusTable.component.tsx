import React from 'react';
import { Grid, LinearProgress, Paper } from '@material-ui/core';

import { Table } from 'datagateway-common';

import { useTranslation } from 'react-i18next';

const AdminDownloadStatusTable: React.FC = () => {
  const [dataLoaded] = React.useState(false);
  const [t] = useTranslation();

  return (
    <Grid container direction="column">
      {/* Show loading progress if data is still being loaded */}
      {!dataLoaded && (
        <Grid item xs={12}>
          <LinearProgress color="secondary" />
        </Grid>
      )}
      <Grid item>
        <Paper
          style={{
            height:
              'calc(100vh - 64px - 30px - 48px - 48px - (1.75rem + 40px))',
            minHeight: 230,
            overflowX: 'auto',
          }}
        >
          <Table
            columns={[
              {
                label: t('downloadStatus.username'),
                dataKey: 'userName',
              },
              {
                label: t('downloadStatus.preparedId'),
                dataKey: 'preparedId',
              },
              {
                label: t('downloadStatus.transport'),
                dataKey: 'transport',
              },
              {
                label: t('downloadStatus.status'),
                dataKey: 'status',
              },
              {
                label: t('downloadStatus.size'),
                dataKey: 'size',
              },
              {
                label: t('downloadStatus.createdAt'),
                dataKey: 'createdAt',
                disableHeaderWrap: true,
              },
              {
                label: t('downloadStatus.deleted'),
                dataKey: 'isDeleted',
              },
            ]}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDownloadStatusTable;
