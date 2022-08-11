import { CopyAll, Download, ZoomIn, ZoomOut } from '@mui/icons-material';
import {
  Alert,
  Button,
  ButtonGroup,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Switch,
} from '@mui/material';
import { downloadDatafile } from 'datagateway-common';
import type { Datafile } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { StateType } from '../../state/app.types';
import {
  ToggleDatafilePreviewerDetailsPanePayload,
  ToggleDatafilePreviewerDetailsPaneType,
} from './state/actions';

interface DatafilePreviewerToolbarProps {
  datafile: Datafile;
  datafileContent?: Blob;
}

/**
 * A toolbar for {@link DatafilePreviewerToolbar} that
 * provides actions to control the previewer or to perform actions on the datafile.
 * @constructor
 */
function DatafilePreviewerToolbar({
  datafile,
  datafileContent,
}: DatafilePreviewerToolbarProps): JSX.Element {
  const [
    isCopyLinkSuccessfulMessageShown,
    setIsCopyLinkSuccessfulMessageShown,
  ] = React.useState(false);
  const isDetailsPanelShown = useSelector<StateType, boolean>(
    (state) => state.dgdataview.isisDatafilePreviewer.isDetailsPaneShown
  );
  const idsUrl = useSelector<StateType, string>(
    (state) => state.dgcommon.urls.idsUrl
  );
  const dispatch = useDispatch();
  const [t] = useTranslation();

  function toggleDetailsPane(shouldShow: boolean): void {
    dispatch({
      type: ToggleDatafilePreviewerDetailsPaneType,
      payload: {
        shouldShow,
      } as ToggleDatafilePreviewerDetailsPanePayload,
    });
  }

  /**
   * Download the datafile to the user computer,
   * depending on whether the content is already downloaded or not.
   */
  function download(): void {
    if (datafileContent) {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(datafileContent);
      link.href = url;
      link.style.display = 'none';
      if (datafile.location) {
        link.download = datafile.location;
      }

      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 0);
    } else if (datafile.location) {
      downloadDatafile(idsUrl, datafile.id, datafile.location);
    }
  }

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
    setIsCopyLinkSuccessfulMessageShown(true);
  }

  return (
    <Paper sx={{ padding: 1 }}>
      <Stack direction="row" justifyContent="space-between">
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
            <Button startIcon={<ZoomIn />}>
              {t('datafiles.preview.toolbar.zoom_in')}
            </Button>
            <Button startIcon={<ZoomOut />}>
              {t('datafiles.preview.toolbar.zoom_out')}
            </Button>
          </ButtonGroup>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={isDetailsPanelShown}
              onChange={(_, checked) => toggleDetailsPane(checked)}
            />
          }
          label={t('datafiles.preview.toolbar.show_details')}
        />
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
          Link copied to clipboard
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default DatafilePreviewerToolbar;
