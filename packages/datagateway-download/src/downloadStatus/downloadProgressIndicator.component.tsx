import { Box, LinearProgress, Typography } from '@mui/material';
import type { Download, FormattedDownload } from 'datagateway-common';
import React from 'react';
import { useDownloadPercentageComplete } from '../downloadApiHooks';

interface DownloadProgressIndicatorProps {
  download: FormattedDownload | Download;
}

/**
 * A component for showing the download progress of the given download item.
 * @param download The download item that this component should show the progress of.
 * @constructor
 */
function DownloadProgressIndicator({
  download,
}: DownloadProgressIndicatorProps): JSX.Element {
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
          <Typography role="" variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
      </Box>
    );

  return <>{progress}</>;
}

export default DownloadProgressIndicator;
