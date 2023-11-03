import { Paper, Stack } from '@mui/material';
import React from 'react';
import ActionButtons from './actionButtons.component';
import RightAlignedControls from './rightAlignedControls';

/**
 * A toolbar for {@link DatafilePreviewerToolbar} that
 * provides actions to control the previewer or to perform actions on the datafile.
 *
 * Requires {@link DatafilePreviewerContext} to be provided.
 */
function DatafilePreviewerToolbar(): JSX.Element {
  return (
    <Paper sx={{ padding: 1 }}>
      <Stack direction="row" justifyContent="space-between">
        <ActionButtons />
        <RightAlignedControls />
      </Stack>
    </Paper>
  );
}

export default DatafilePreviewerToolbar;
