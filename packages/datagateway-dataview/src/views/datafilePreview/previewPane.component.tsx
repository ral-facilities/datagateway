import { Paper, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { DatafileExtension } from './datafileExtension';
import DatafilePreviewerContext from './datafilePreviewerContext';
import { previewComponents } from './previewComponents/previewComponents';

/**
 * @see PreviewPane
 */
interface PreviewPaneProps {
  datafileExtension: DatafileExtension;
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
function PreviewPane({ datafileExtension }: PreviewPaneProps): JSX.Element {
  const previewerContext = useContext(DatafilePreviewerContext);
  const theme = useTheme();

  // this should only occur when DatafilePreviewerContext is not provided
  if (!previewerContext) return <></>;

  const { datafile, datafileContent } = previewerContext;

  if (!datafileContent) return <></>;

  const PreviewComponent = previewComponents[datafileExtension];
  return (
    <Paper
      variant="outlined"
      sx={{
        height: `calc(100vh - 64px - 36px - 48px - 48px + ${theme.spacing(
          2
        )} * 2)`,
        overflowY: 'auto',
        display: 'flex',
      }}
    >
      <PreviewComponent datafile={datafile} datafileContent={datafileContent} />
    </Paper>
  );
}

export default PreviewPane;
