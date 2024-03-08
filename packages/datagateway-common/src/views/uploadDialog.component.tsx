import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent as MuiDialogContent,
  Grid,
  styled,
  TextField,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import GoldenRetriever from '@uppy/golden-retriever';
import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

import { readSciGatewayToken } from '../parseTokens';
import { createDataset } from '../api';
// import { ErrorOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

interface UploadDialogProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  open: boolean;

  setClose: () => void;
}

const UploadDialog: React.FC<UploadDialogProps> = (
  props: UploadDialogProps
) => {
  const { entityType, entityId, open, setClose } = props;
  const queryClient = useQueryClient();
  const uploadUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.uploadUrl
  );
  const [uppy] = React.useState(() =>
    new Uppy({
      // debug: true,
      id:
        `${
          entityType === 'investigation' ? 'investigation' : 'dataset'
        }-${props.entityId?.toString()}` ?? 'null',
      autoProceed: false,
      restrictions: {
        maxTotalFileSize: 5368709120,
      },
      meta: {
        datafileDescription: '',
        userSession: readSciGatewayToken().sessionId,
      },
      onBeforeFileAdded: (currentFile) => {
        const isCorrectExtension = currentFile.name.endsWith('.xml');
        if (isCorrectExtension) {
          uppy.info('.xml files are not allowed');
          return false;
        } else {
          return true;
        }
      },
    })
      .on('error', (error) => {
        uppy.info(error.message, 'error', 5000);
      })
      .on('upload-success', (file, response) => {
        if (entityType === 'datafile') {
          queryClient.invalidateQueries(['datafile']);
        } else {
          queryClient.invalidateQueries([
            `${entityType === 'dataset' ? 'Datafile' : 'Dataset'}Count`,
            entityId,
          ]);
        }
      })
      .use(Tus, {
        endpoint: `${uploadUrl}/upload/`,
        uploadDataDuringCreation: true,
      })
  );

  // TODO: investigate why this causes tests to fail
  // Temporary fix (?): only use GoldenRetriever if indexedDB is available
  React.useEffect(() => {
    if (window.indexedDB) {
      uppy.use(GoldenRetriever);
    }
  }, [uppy]);

  const [t] = useTranslation();
  const theme = useTheme();

  const [uploadName, setUploadName] = React.useState<string>('');
  const [uploadDescription, setUploadDescription] = React.useState<string>('');

  const dialogClose = (_event?: unknown, reason?: string): void => {
    if (reason !== 'backdropClick') {
      uppy.cancelAll({ reason: 'user' });
      setClose();
    }
  };

  const uploadData = async (): Promise<void> => {
    // If uploading a dataset, create the dataset first
    // Name the dataset and not uploaded files
    if (entityType === 'investigation') {
      const result = await createDataset(
        uploadUrl,
        uploadName,
        uploadDescription,
        entityId
      );
      uppy.setMeta({
        datasetId: result,
      });
    } else {
      uppy.setMeta({
        datasetId: entityId,
      });
    }
    uppy.upload();
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth={'md'} onClose={dialogClose}>
      <DialogTitle
        id="download-confirm-dialog-title"
        sx={{ margin: 0, padding: 2 }}
      >
        <Typography sx={{ fontSize: '1.25rem' }}>
          {entityType === 'investigation'
            ? t('buttons.upload_dataset')
            : t('buttons.upload_datafile')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} paddingTop={1}>
          {entityType === 'investigation' && (
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                height="100%"
                justifyContent="space-between"
              >
                <TextField
                  id="upload-name"
                  label={t('upload.name')}
                  fullWidth={true}
                  inputProps={{ maxLength: 255 }}
                  variant="outlined"
                  onChange={(e) => {
                    setUploadName(e.target.value as string);
                  }}
                  required
                />

                <TextField
                  id="upload-description"
                  label={t('upload.description')}
                  fullWidth={true}
                  inputProps={{ maxLength: 2000 }}
                  variant="outlined"
                  onChange={(e) => {
                    setUploadDescription(e.target.value as string);
                  }}
                  multiline
                  rows={16}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={entityType !== 'investigation' ? 12 : 8}>
            <Dashboard
              uppy={uppy}
              proudlyDisplayPoweredByUppy={false}
              note="No .XML files, Total file size 5GB or less"
              showProgressDetails={true}
              hideUploadButton={true}
              fileManagerSelectionType="both"
              hideProgressAfterFinish={false}
              height="30em"
              width="100%"
              theme={theme.palette.mode}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Grid container spacing={2} paddingLeft={1}>
        {/* {entityType !== 'investigation' && (
          <Grid item xs={6} display="flex" alignItems="center">
            <ErrorOutline sx={{ fontSize: '2rem' }} />
            <Typography sx={{ fontSize: '1rem' }} marginLeft={1}>
              {'Only files can be added to Datasets (no folders)'}
            </Typography>
          </Grid>
        )} */}
        <Grid item xs>
          <DialogActions sx={{ margin: 0, paddingTop: 0 }}>
            <Button onClick={dialogClose} aria-label="cancel">
              Cancel
            </Button>
            <Button onClick={setClose} aria-label="close">
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => uploadData()}
              aria-label="upload"
            >
              Upload
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default UploadDialog;
