import { Box, LinearProgress, Typography } from '@mui/material';
import type { FormattedDownload } from 'datagateway-common';
import React from 'react';
import type { TableCellProps } from 'react-virtualized';
import { useDownloadPercentageComplete } from '../downloadApiHooks';

function DownloadProgressIndicator({
  rowData,
}: TableCellProps): React.ReactNode {
  const download = rowData as FormattedDownload;

  const { data: progress, isLoading } = useDownloadPercentageComplete({
    prepareId: download.preparedId,
  });

  if (isLoading) return <LinearProgress />;

  if (typeof progress === 'number')
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 32 }}>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
      </Box>
    );

  return progress;
}

export default DownloadProgressIndicator;
