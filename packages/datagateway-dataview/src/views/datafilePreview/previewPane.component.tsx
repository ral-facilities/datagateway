import { Paper } from '@mui/material';
import { Datafile } from 'datagateway-common';
import React from 'react';
import { DatafileExtension } from './datafileExtension';
import { previewComponents } from './previewComponents/previewComponents';

/**
 * @see PreviewPane
 */
interface PreviewPaneProps {
  datafile: Datafile;
  datafileExtension: DatafileExtension;
  datafileContent: Blob;
}

/**
 * A pane in {@link DatafilePreviewer} that contains the preview of the given {@link Datafile}.
 *
 * @param datafile The {@link Datafile} to be previewed.
 * @param datafileContent The content of the {@link Datafile} in {@link Blob}
 * @param datafileExtension The file name extension of the {@link Datafile}
 * @see DatafilePreviewer
 * @see DetailsPane
 * @constructor
 */
function PreviewPane({
  datafile,
  datafileExtension,
  datafileContent,
}: PreviewPaneProps): JSX.Element {
  const PreviewComponent = previewComponents[datafileExtension];
  return (
    <Paper
      variant="outlined"
      sx={{
        height: 'calc(100vh - 64px - 36px - 48px - 48px)',
        padding: 2,
        overflowY: 'auto',
        display: 'flex',
      }}
    >
      <PreviewComponent datafile={datafile} datafileContent={datafileContent} />
    </Paper>
  );
}

export default PreviewPane;
