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
} from '@mui/material';

/* eslint-disable import/no-extraneous-dependencies */
//TODO: Investigate why this causes linting errors
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import GoldenRetriever from '@uppy/golden-retriever';
import '@uppy/core/dist/style.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

import { readSciGatewayToken } from '../parseTokens';
import { createDataset } from '../api';
import { ErrorOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Initialise Uppy - metadata is set in uploadData()
const uppy = new Uppy({
  debug: true,
  autoProceed: false,
  restrictions: {
    maxTotalFileSize: 5000000000,
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
}).on('complete', (file) => {
  console.log(file);
});

// Add endpoint for file upload
// TODO: remove hard coded endpoint
uppy.use(Tus, {
  endpoint: 'http://127.0.0.1:8181/upload/',
  uploadDataDuringCreation: true,
});

uppy.use(GoldenRetriever);

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

  const [t] = useTranslation();

  const [uploadName, setUploadName] = React.useState<string>('');
  const [uploadDescription, setUploadDescription] = React.useState<string>('');

  const dialogClose = (): void => {
    uppy.cancelAll({ reason: 'user' });
    setClose();
  };

  const uploadData = async (): Promise<void> => {
    // If uploading a dataset, create the dataset first
    // Name the dataset and not uploaded files
    if (entityType === 'investigation') {
      const datasetId = await createDataset(
        uploadName,
        uploadDescription,
        entityId
      );
      uppy.setMeta({
        datasetId: parseInt(datasetId),
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
        <Grid container spacing={2}>
          {entityType === 'investigation' && (
            <Grid item xs={4}>
              <Grid container spacing={2} height="15em">
                <Grid item xs={12} marginTop="0.5em">
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
                </Grid>
                <Grid item xs={12}>
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
                    rows={6}
                  />
                </Grid>
              </Grid>
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
              height="16em"
              width="100%"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Grid container spacing={2} paddingLeft={1}>
        {entityType !== 'investigation' && (
          <Grid item xs={6} display="flex" alignItems="center">
            <ErrorOutline sx={{ fontSize: '2rem' }} />
            <Typography sx={{ fontSize: '1rem' }} marginLeft={1}>
              {'Only files can be added to Datasets (no folders)'}
            </Typography>
          </Grid>
        )}
        <Grid item xs>
          <DialogActions sx={{ margin: 0 }}>
            <Button onClick={dialogClose}>Cancel</Button>
            <Button color="primary" onClick={() => uploadData()}>
              Upload
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default UploadDialog;
