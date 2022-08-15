import {
  CopyAll,
  Download,
  RestartAlt,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  ButtonGroup,
  Fade,
  Snackbar,
  Stack,
} from '@mui/material';
import { downloadDatafile } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import DatafilePreviewerContext from '../datafilePreviewerContext';
import DATAFILE_PREVIEWER_DEFAULT from '../defaults';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
  ResetDatafilePreviewerZoomLevelType,
} from '../state/actions';

/**
 * Buttons in {@link DatafilePreviewerToolbar} that performs various actions.
 *
 * Contains the following controls:
 *   - Download datafile button
 *   - Copy datafile link button
 *   - Zoom controls
 *   - Reset zoom (if zoom level is changed)
 */
function ActionButtons(): JSX.Element {
  const [
    isCopyLinkSuccessfulMessageShown,
    setIsCopyLinkSuccessfulMessageShown,
  ] = React.useState(false);
  const previewerContext = React.useContext(DatafilePreviewerContext);
  const dispatch = useDispatch();
  const idsUrl = useSelector<StateType, string>(
    (state) => state.dgcommon.urls.idsUrl
  );
  // zoom level is considered changed if it is different from the default zoom level.
  const isZoomLevelChanged = useSelector<StateType, boolean>(
    (state) =>
      state.dgdataview.isisDatafilePreviewer.zoomLevel !==
      DATAFILE_PREVIEWER_DEFAULT.zoomLevel
  );
  const [t] = useTranslation();

  // this should only occur when DatafilePreviewerContext is not provided
  if (!previewerContext) return <></>;

  const { datafile, datafileContent } = previewerContext;

  function zoomIn(): void {
    dispatch({
      type: IncrementDatafilePreviewerZoomLevelType,
    });
  }

  function zoomOut(): void {
    dispatch({
      type: DecrementDatafilePreviewerZoomLevelType,
    });
  }

  function resetZoom(): void {
    dispatch({
      type: ResetDatafilePreviewerZoomLevelType,
    });
  }

  /**
   * Download the datafile to the user computer,
   * depending on whether the content is already downloaded or not.
   */
  function download(): void {
    if (datafile.location) {
      downloadDatafile(idsUrl, datafile.id, datafile.location, datafileContent);
    }
  }

  /**
   * Copies the link to the current datafile to the clipboard.
   */
  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
    setIsCopyLinkSuccessfulMessageShown(true);
  }

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="text"
          startIcon={<Download />}
          onClick={() => download()}
        >
          {t('buttons.download')}
        </Button>
        <Button
          variant="text"
          startIcon={<CopyAll />}
          onClick={() => copyLink()}
        >
          {t('datafiles.preview.toolbar.copy_link')}
        </Button>
        <ButtonGroup
          variant="text"
          aria-label={t('datafiles.preview.toolbar.zoom_control')}
        >
          <Button startIcon={<ZoomIn />} onClick={zoomIn}>
            {t('datafiles.preview.toolbar.zoom_in')}
          </Button>
          <Button startIcon={<ZoomOut />} onClick={zoomOut}>
            {t('datafiles.preview.toolbar.zoom_out')}
          </Button>
        </ButtonGroup>
        <Fade in={isZoomLevelChanged} mountOnEnter unmountOnExit>
          <Button variant="text" startIcon={<RestartAlt />} onClick={resetZoom}>
            {t('datafiles.preview.toolbar.reset_zoom')}
          </Button>
        </Fade>
      </Stack>
      <Snackbar
        open={isCopyLinkSuccessfulMessageShown}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => setIsCopyLinkSuccessfulMessageShown(false)}
      >
        <Alert
          severity="success"
          elevation={4}
          onClose={() => setIsCopyLinkSuccessfulMessageShown(false)}
        >
          {t('datafiles.preview.link_copied')}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ActionButtons;
